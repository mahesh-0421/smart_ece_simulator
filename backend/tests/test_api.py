import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.core.database import init_db

init_db()
client = TestClient(app)

def test_api_status():
    res = client.get("/api/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["tools"]["octave"]["available"] is True
    assert data["tools"]["iverilog"]["available"] is True

def test_api_matlab_execute():
    res = client.post("/api/matlab/execute", json={
        "code": "v = [2 4 6]; disp(sum(v));",
        "filename": "sum_test.m"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "12" in data["stdout"]

def test_api_verilog_simulate():
    design = """
    module inv (input wire a, output wire y);
        assign y = ~a;
    endmodule
    """
    tb = """
    `timescale 1ns / 1ps
    module tb_inv;
        reg a;
        wire y;
        inv uut (.a(a), .y(y));
        initial begin
            $dumpfile("dump.vcd");
            $dumpvars(0, tb_inv);
            a = 0; #10;
            a = 1; #10;
            $finish;
        end
    endmodule
    """
    res = client.post("/api/verilog/simulate", json={
        "code": design,
        "filename": "inv.v",
        "testbench_code": tb,
        "testbench_filename": "tb_inv.v"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["compiled"] is True
    assert data["has_waveform"] is True

def test_api_generate_testbench():
    code = """
    module mux2 (input wire d0, input wire d1, input wire s, output wire y);
        assign y = s ? d1 : d0;
    endmodule
    """
    res = client.post("/api/verilog/generate-testbench", json={"code": code})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "tb_mux2" in data["testbench_code"]

def test_api_program_crud():
    # Create program
    create_res = client.post("/api/programs", json={
        "title": "CRUD Test Program",
        "filename": "crud_test.m",
        "language": "matlab",
        "code": "disp('Hello CRUD');",
        "description": "Integration test"
    })
    assert create_res.status_code == 200
    prog_id = create_res.json()["id"]

    # Get program
    get_res = client.get(f"/api/programs/{prog_id}")
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "CRUD Test Program"

    # Update program
    put_res = client.put(f"/api/programs/{prog_id}", json={
        "title": "Updated CRUD Title"
    })
    assert put_res.status_code == 200
    assert put_res.json()["title"] == "Updated CRUD Title"

    # Delete program
    del_res = client.delete(f"/api/programs/{prog_id}")
    assert del_res.status_code == 200

def test_api_experiments():
    res = client.get("/api/experiments")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 20  # 10 MATLAB + 10 Verilog

def test_api_report_generation():
    res = client.post("/api/reports/generate", json={
        "title": "API Test Lab Report",
        "language": "matlab",
        "code": "x = 1:5; disp(x);",
        "status": "success",
        "duration_ms": 32.5,
        "stdout": "1 2 3 4 5",
        "objective": "Test report generator endpoint"
    })
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert len(res.content) > 1000
