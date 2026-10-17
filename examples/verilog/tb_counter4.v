`timescale 1ns / 1ps

module tb_counter4;
    reg clk;
    reg reset;
    wire [3:0] count;

    counter4 uut (
        .clk(clk),
        .reset(reset),
        .count(count)
    );

    // 10ns Clock Period
    always #5 clk = ~clk;

    initial begin
        // Configure VCD Waveform Dump
        $dumpfile("dump.vcd");
        $dumpvars(0, tb_counter4);

        clk = 0;
        reset = 1;

        #12 reset = 0; // Release reset

        #100; // Simulate 100ns

        $display("Simulation finished at time %0t", $time);
        $finish;
    end

    initial begin
        $monitor("Time=%0t | clk=%b reset=%b | count=%b (%0d)",
                 $time, clk, reset, count, count);
    end
endmodule
