from typing import List, Dict, Any, Optional

EXPERIMENTS_DATABASE: List[Dict[str, Any]] = [
    # ------------------ MATLAB EXPERIMENTS ------------------
    {
        "id": "mat-01",
        "title": "Basic Arithmetic and Scalar Computations",
        "category": "matlab",
        "objective": "Understand scalar variables, algebraic operations, mathematical functions, and precedence in MATLAB/Octave.",
        "required_software": "GNU Octave (MATLAB-Compatible)",
        "theory": "MATLAB/Octave represents real and complex numbers in double precision. Basic operators (+, -, *, /, ^) follow standard PEMDAS precedence. Trigonometric, logarithmic, and exponential operations are built-in.",
        "procedure": [
            "Initialize variables with scalar values.",
            "Compute algebraic expressions and exponential powers.",
            "Display results using disp() and formatted strings."
        ],
        "sample_code": """% Experiment 1: Basic Arithmetic Operations
x = 12.5;
y = 4.2;

sum_val = x + y;
prod_val = x * y;
quotient = x / y;
power_val = x ^ 2;

disp('Arithmetic Computation Results:');
fprintf('x = %.2f, y = %.2f\\n', x, y);
fprintf('x + y = %.4f\\n', sum_val);
fprintf('x * y = %.4f\\n', prod_val);
fprintf('x / y = %.4f\\n', quotient);
fprintf('x^2   = %.4f\\n', power_val);
""",
        "sample_testbench": None,
        "expected_output": "Arithmetic Computation Results:\nx = 12.50, y = 4.20\nx + y = 16.7000\nx * y = 52.5000\nx / y = 2.9762\nx^2   = 156.2500",
        "expected_waveform_desc": None,
        "result_explanation": "Variables were correctly evaluated according to double-precision floating point arithmetic rules.",
        "conclusion": "Basic scalar calculations, formatted string prints, and variable assignments were verified successfully.",
        "tags": ["basics", "arithmetic", "scalar"]
    },
    {
        "id": "mat-02",
        "title": "Matrix Addition and Multiplication",
        "category": "matlab",
        "objective": "Perform 2D matrix creation, verify conformability conditions, and compute matrix addition and algebraic multiplication.",
        "required_software": "GNU Octave (MATLAB-Compatible)",
        "theory": "For matrix addition A + B, both matrices must share the exact dimensions m x n. For matrix multiplication C = A * B, the number of columns in A must equal the number of rows in B.",
        "procedure": [
            "Define two 2x2 or 3x3 matrices A and B.",
            "Compute linear sum A + B.",
            "Compute linear algebra product A * B.",
            "Compute element-wise product A .* B and observe difference."
        ],
        "sample_code": """% Experiment 2: Matrix Addition and Multiplication
A = [1, 2, 3; 4, 5, 6; 7, 8, 9];
B = [9, 8, 7; 6, 5, 4; 3, 2, 1];

disp('Matrix A:');
disp(A);

disp('Matrix B:');
disp(B);

sum_mat = A + B;
disp('Matrix Addition (A + B):');
disp(sum_mat);

prod_mat = A * B;
disp('Linear Algebra Product (A * B):');
disp(prod_mat);

elem_prod = A .* B;
disp('Element-Wise Product (A .* B):');
disp(elem_prod);
""",
        "sample_testbench": None,
        "expected_output": "Matrix A:\n 1 2 3\n 4 5 6\n 7 8 9\n\nMatrix Addition:\n 10 10 10\n 10 10 10\n 10 10 10",
        "expected_waveform_desc": None,
        "result_explanation": "Demonstrates the distinct difference between linear algebraic matrix multiplication (A * B) and Hadamard element-wise multiplication (A .* B).",
        "conclusion": "Matrix dimensional rules and vector operations in GNU Octave verified successfully.",
        "tags": ["matrix", "linear-algebra", "multiplication"]
    },
    {
        "id": "mat-03",
        "title": "Matrix Transpose and Determinant",
        "category": "matlab",
        "objective": "Compute transpose, determinant, and matrix inverse using Octave functions.",
        "required_software": "GNU Octave (MATLAB-Compatible)",
        "theory": "The transpose A' swaps rows and columns (A_ji = A_ij). The determinant det(A) determines singularity; non-zero determinant guarantees existence of inverse inv(A).",
        "procedure": [
            "Create a non-singular 3x3 square matrix M.",
            "Compute transpose M'.",
            "Calculate det(M) and inv(M).",
            "Verify M * inv(M) yields identity matrix eye(3)."
        ],
        "sample_code": """% Experiment 3: Transpose, Determinant, and Inverse
M = [2, 1, 1; 1, 3, 2; 1, 0, 0];
disp('Matrix M:');
disp(M);

disp('Transpose of M:');
disp(M');

d = det(M);
fprintf('Determinant det(M) = %.4f\\n', d);

if abs(d) > 1e-6
    inv_M = inv(M);
    disp('Matrix Inverse:');
    disp(inv_M);
    
    disp('Verification M * inv(M):');
    disp(round(M * inv_M));
else
    disp('Matrix is singular, inverse does not exist.');
endif
""",
        "sample_testbench": None,
        "expected_output": "Determinant det(M) = -1.0000\nIdentity matrix verification passed.",
        "expected_waveform_desc": None,
        "result_explanation": "Computes exact algebraic inverse and confirms identity property.",
        "conclusion": "Matrix inversion and transpose operations verified successfully.",
        "tags": ["matrix", "determinant", "inverse"]
    },
    {
        "id": "mat-04",
        "title": "Vector Operations and Dot Product",
        "category": "matlab",
        "objective": "Construct row and column vectors, perform slicing, norm calculations, and inner/outer products.",
        "required_software": "GNU Octave (MATLAB-Compatible)",
        "theory": "Vectors are 1-D arrays. The dot product u . v = sum(u_i * v_i) = u * v'. Vector magnitude is the Euclidean norm sqrt(sum(u_i^2)).",
        "procedure": [
            "Create row vector u and column vector v.",
            "Compute dot product with dot(u, v) and u * v.",
            "Calculate Euclidean vector norm with norm()."
        ],
        "sample_code": """% Experiment 4: Vector Operations
u = [1, 3, -5, 7];
v = [4, -2, 0, 1];

disp('Vector u:');
disp(u);
disp('Vector v:');
disp(v);

dp = dot(u, v);
fprintf('Dot Product (u . v) = %d\\n', dp);

norm_u = norm(u);
fprintf('Euclidean Norm ||u|| = %.4f\\n', norm_u);

v_rev = fliplr(u);
disp('Reversed Vector u:');
disp(v_rev);
""",
        "sample_testbench": None,
        "expected_output": "Dot Product (u . v) = 5\nEuclidean Norm ||u|| = 9.1652",
        "expected_waveform_desc": None,
        "result_explanation": "Validates vector slicing and inner-product calculations.",
        "conclusion": "Vector algebra and index manipulation verified.",
        "tags": ["vectors", "dot-product", "norm"]
    },
    {
        "id": "mat-05",
        "title": "Continuous Sine and Cosine Plotting",
        "category": "matlab",
        "objective": "Generate continuous-time sinusoidal signals, customize graph labels, legends, line styles, and produce an exportable plot.",
        "required_software": "GNU Octave (MATLAB-Compatible)",
        "theory": "Harmonic sinusoids x(t) = A*sin(2*pi*f*t) represent fundamental carrier and test waveforms across communication channels.",
        "procedure": [
            "Create time vector t from 0 to 1 with step 0.005.",
            "Compute sine and cosine waves at 2 Hz frequency.",
            "Plot both waveforms with grid, labels, and legend."
        ],
        "sample_code": """% Experiment 5: Sine and Cosine Waveform Visualization
t = 0:0.005:1;
f = 2; % Frequency = 2 Hz

y_sin = sin(2 * pi * f * t);
y_cos = cos(2 * pi * f * t);

figure(1);
plot(t, y_sin, 'b-', 'LineWidth', 2);
hold on;
plot(t, y_cos, 'r--', 'LineWidth', 2);
hold off;

grid on;
title('Sinusoidal Waveforms (2 Hz)');
xlabel('Time (seconds)');
ylabel('Amplitude');
legend('Sine Wave', 'Cosine Wave', 'Location', 'northeast');

disp('Plot generated successfully.');
disp(['Number of sample points: ', num2str(length(t))]);
""",
        "sample_testbench": None,
        "expected_output": "Plot generated successfully.\nNumber of sample points: 201",
        "expected_waveform_desc": "Two continuous periodic waveforms oscillating between -1 and +1.",
        "result_explanation": "Generates clear graphical visualization showing the 90-degree phase shift between sine and cosine.",
        "conclusion": "Plotting capabilities and visual rendering in GNU Octave confirmed.",
        "tags": ["signals", "plotting", "sine", "cosine"]
    },
    {
        "id": "mat-06",
        "title": "Sampling Theorem and Signal Visualization",
        "category": "matlab",
        "objective": "Demonstrate Nyquist-Shannon sampling theorem by comparing adequately sampled vs under-sampled waveforms.",
        "required_software": "GNU Octave (MATLAB-Compatible)",
        "theory": "The Nyquist criterion states that a continuous-time signal with maximum frequency fm must be sampled at Fs > 2*fm to prevent aliasing distortion.",
        "procedure": [
            "Define analog signal at 5 Hz.",
            "Sample at high rate (Fs = 100 Hz) and marginal rate (Fs = 12 Hz).",
            "Plot both continuous curve and discrete stem samples."
        ],
        "sample_code": """% Experiment 6: Sampling and Discrete Representation
f_sig = 5; % 5 Hz signal

% High-resolution analog reference
t_cont = 0:0.001:0.5;
x_cont = cos(2 * pi * f_sig * t_cont);

% Discrete sampling at Fs = 40 Hz (adequately sampled)
Fs = 40;
t_disc = 0:(1/Fs):0.5;
x_disc = cos(2 * pi * f_sig * t_disc);

figure(1);
plot(t_cont, x_cont, 'b-', 'LineWidth', 1.5);
hold on;
stem(t_disc, x_disc, 'r', 'filled', 'LineWidth', 1.5);
hold off;

grid on;
title('Continuous vs Sampled Signal (Nyquist Fs = 40Hz > 2*5Hz)');
xlabel('Time (seconds)');
ylabel('Amplitude');
legend('Continuous Analog Signal', 'Discrete Samples (Fs=40Hz)');

fprintf('Continuous points: %d, Discrete sample count: %d\\n', length(t_cont), length(t_disc));
""",
        "sample_testbench": None,
        "expected_output": "Continuous points: 501, Discrete sample count: 21",
        "expected_waveform_desc": "Continuous curve overlaid with stem markers representing digital samples.",
        "result_explanation": "Demonstrates digital sampling representation without aliasing.",
        "conclusion": "Sampling theorem and discrete stem plotting verified.",
        "tags": ["dsp", "sampling", "nyquist", "stem"]
    },
    {
        "id": "mat-07",
        "title": "Discrete-Time Linear Convolution",
        "category": "matlab",
        "objective": "Compute linear convolution y[n] = x[n] * h[n] of discrete input and impulse response sequences.",
        "required_software": "GNU Octave (MATLAB-Compatible)",
        "theory": "Convolution describes the output of a Linear Time-Invariant (LTI) system. For sequence x of length N and h of length M, the result length is N + M - 1.",
        "procedure": [
            "Define input vector x[n] and system impulse response h[n].",
            "Compute linear convolution using conv().",
            "Plot input, impulse response, and output sequences."
        ],
        "sample_code": """% Experiment 7: Discrete Linear Convolution
x = [1, 2, 3, 1];     % Input signal
h = [1, 1, 1];        % 3-point moving average filter

y = conv(x, h);

disp('Input signal x[n]:');
disp(x);
disp('Impulse response h[n]:');
disp(h);
disp('Convolution Result y[n] = x[n] * h[n]:');
disp(y);

figure(1);
subplot(3, 1, 1);
stem(0:length(x)-1, x, 'filled'); grid on; title('Input x[n]');
subplot(3, 1, 2);
stem(0:length(h)-1, h, 'filled', 'r'); grid on; title('Impulse Response h[n]');
subplot(3, 1, 3);
stem(0:length(y)-1, y, 'filled', 'k'); grid on; title('Output y[n]');

fprintf('Lengths: x=%d, h=%d, y=%d (Expected %d)\\n', ...
        length(x), length(h), length(y), length(x)+length(h)-1);
""",
        "sample_testbench": None,
        "expected_output": "Convolution Result y[n] = x[n] * h[n]:\n 1 3 6 6 4 1\nLengths: x=4, h=3, y=6 (Expected 6)",
        "expected_waveform_desc": "3-panel subplot showing discrete impulses.",
        "result_explanation": "Verified that length of y[n] equals N + M - 1 and amplitude matches polynomial multiplication.",
        "conclusion": "LTI discrete system convolution verified.",
        "tags": ["dsp", "convolution", "lti"]
    },
    {
        "id": "mat-08",
        "title": "Discrete Fourier Transform (FFT) Demonstration",
        "category": "matlab",
        "objective": "Compute Fast Fourier Transform (FFT) to identify frequency spectrum components of a composite signal.",
        "required_software": "GNU Octave (MATLAB-Compatible)",
        "theory": "The Fast Fourier Transform transforms time-domain signals into the frequency domain, revealing constituent spectral peaks.",
        "procedure": [
            "Synthesize signal containing 10 Hz and 25 Hz tones with noise.",
            "Compute two-sided and single-sided FFT amplitude spectrum.",
            "Plot frequency peaks."
        ],
        "sample_code": """% Experiment 8: Frequency Spectrum via Fast Fourier Transform (FFT)
Fs = 200;            % Sampling frequency (Hz)
T = 1/Fs;             % Sampling interval
L = 200;              % Length of signal
t = (0:L-1)*T;        % Time vector

% Form signal: sum of 10 Hz and 25 Hz sinusoids
S = 0.7*sin(2*pi*10*t) + 1.2*sin(2*pi*25*t);

% Compute FFT
Y = fft(S);
P2 = abs(Y/L);
P1 = P2(1:L/2+1);
P1(2:end-1) = 2*P1(2:end-1);
f_axis = Fs*(0:(L/2))/L;

figure(1);
plot(f_axis, P1, 'b-', 'LineWidth', 2);
grid on;
title('Single-Sided Amplitude Spectrum of S(t)');
xlabel('Frequency (Hz)');
ylabel('|P1(f)|');

disp('Spectral Peaks Identified:');
[pks, locs] = find(P1 > 0.5);
for i = 1:length(locs)
    fprintf('  Peak at %.1f Hz with amplitude %.2f\\n', f_axis(locs(i)), P1(locs(i)));
endfor
""",
        "sample_testbench": None,
        "expected_output": "Spectral Peaks Identified:\n  Peak at 10.0 Hz with amplitude 0.70\n  Peak at 25.0 Hz with amplitude 1.20",
        "expected_waveform_desc": "Spectral graph with two distinct spikes at 10 Hz and 25 Hz.",
        "result_explanation": "FFT accurately identifies the frequency and amplitude of the individual sinusoid components.",
        "conclusion": "Frequency-domain spectral decomposition verified.",
        "tags": ["fft", "spectrum", "fourier", "dsp"]
    },
    {
        "id": "mat-09",
        "title": "Digital Modulation: Binary Phase Shift Keying (BPSK)",
        "category": "matlab",
        "objective": "Generate and visualize a BPSK modulated carrier signal corresponding to a digital bitstream.",
        "required_software": "GNU Octave (MATLAB-Compatible)",
        "theory": "In BPSK, binary 1 is transmitted as phase 0 (cos(w*t)) and binary 0 is transmitted as phase 180 deg (-cos(w*t)).",
        "procedure": [
            "Define binary data sequence [1 0 1 1 0].",
            "Generate high-frequency sinusoidal carrier.",
            "Modulate carrier phase according to bits and plot result."
        ],
        "sample_code": """% Experiment 9: BPSK Digital Modulation
bits = [1, 0, 1, 1, 0];
Tb = 1; % Bit duration 1s
samples_per_bit = 100;
fc = 2; % Carrier frequency 2 Hz

t = [];
bpsk_signal = [];

for i = 1:length(bits)
    t_bit = linspace((i-1)*Tb, i*Tb, samples_per_bit);
    if bits(i) == 1
        wave = cos(2 * pi * fc * t_bit);
    else
        wave = -cos(2 * pi * fc * t_bit); % 180 degree phase shift
    endif
    t = [t, t_bit];
    bpsk_signal = [bpsk_signal, wave];
endfor

figure(1);
plot(t, bpsk_signal, 'k-', 'LineWidth', 1.8);
grid on;
title('Binary Phase Shift Keying (BPSK) Modulated Signal: [1 0 1 1 0]');
xlabel('Time (seconds)');
ylabel('Modulated Amplitude');

disp('BPSK Modulation completed for bitstream: 1 0 1 1 0');
""",
        "sample_testbench": None,
        "expected_output": "BPSK Modulation completed for bitstream: 1 0 1 1 0",
        "expected_waveform_desc": "Carrier wave showing 180-degree phase inversions at bit transitions.",
        "result_explanation": "Illustrates carrier phase transitions corresponding to digital 0 and 1 symbols.",
        "conclusion": "Digital communication carrier modulation verified.",
        "tags": ["communications", "bpsk", "modulation"]
    },
    {
        "id": "mat-10",
        "title": "Numerical Differentiation and Integration",
        "category": "matlab",
        "objective": "Implement forward difference numerical differentiation and trapezoidal numerical integration.",
        "required_software": "GNU Octave (MATLAB-Compatible)",
        "theory": "Numerical differentiation estimates f'(x) ~ (f(x+h) - f(x))/h using diff(). Numerical integration computes definite integrals via the trapezoidal rule trapz().",
        "procedure": [
            "Define function f(x) = x^2 over [0, 4].",
            "Compute derivative using diff() / dx and compare with analytical 2*x.",
            "Compute area using trapz() and compare with analytical integral (64/3)."
        ],
        "sample_code": """% Experiment 10: Numerical Calculus (diff & trapz)
dx = 0.01;
x = 0:dx:4;
y = x .^ 2;

% Numerical derivative
dy_num = diff(y) / dx;
x_diff = x(1:end-1);
dy_exact = 2 * x_diff;

% Numerical integral of x^2 from 0 to 4: exact = 4^3 / 3 = 64/3 = 21.3333
area_num = trapz(x, y);
area_exact = (4^3) / 3;

fprintf('Numerical Integral (trapz): %.4f\\n', area_num);
fprintf('Exact Analytical Integral: %.4f\\n', area_exact);
fprintf('Integration Error: %.6f\\n', abs(area_num - area_exact));

figure(1);
plot(x_diff, dy_num, 'b-', 'LineWidth', 2);
hold on;
plot(x_diff, dy_exact, 'r--', 'LineWidth', 2);
grid on;
title('Numerical Derivative of f(x) = x^2');
xlabel('x'); ylabel('df/dx');
legend('Numerical diff()', 'Analytical 2*x');
""",
        "sample_testbench": None,
        "expected_output": "Numerical Integral (trapz): 21.3334\nExact Analytical Integral: 21.3333\nIntegration Error: 0.000067",
        "expected_waveform_desc": "Linear plot showing excellent convergence between numerical and analytical derivatives.",
        "result_explanation": "Trapezoidal approximation achieves high numerical precision with small dx.",
        "conclusion": "Numerical calculus techniques confirmed.",
        "tags": ["calculus", "numerical-methods", "differentiation", "integration"]
    },

    # ------------------ VERILOG EXPERIMENTS ------------------
    {
        "id": "vlog-01",
        "title": "Basic Logic Gates (AND, OR, NOT, XOR, NAND, NOR, XNOR)",
        "category": "verilog",
        "objective": "Design, simulate, and verify truth tables of all standard primitive logic gates in Verilog HDL.",
        "required_software": "Icarus Verilog 12.0 + VVP Engine",
        "theory": "Fundamental digital logic gates form the building blocks of combinational circuits. Verification is carried out across all 4 combinations of binary inputs A and B.",
        "procedure": [
            "Declare module logic_gates with inputs A, B and gate outputs.",
            "Use continuous assignments (assign) for each logic function.",
            "Run testbench across combinations (00, 01, 10, 11) and inspect waveforms."
        ],
        "sample_code": """// Design: Basic Logic Gates
module logic_gates (
    input wire a,
    input wire b,
    output wire out_and,
    output wire out_or,
    output wire out_not,
    output wire out_xor,
    output wire out_nand,
    output wire out_nor,
    output wire out_xnor
);

    assign out_and  = a & b;
    assign out_or   = a | b;
    assign out_not  = ~a;
    assign out_xor  = a ^ b;
    assign out_nand = ~(a & b);
    assign out_nor  = ~(a | b);
    assign out_xnor = ~(a ^ b);

endmodule
""",
        "sample_testbench": """// Testbench: Basic Logic Gates
`timescale 1ns / 1ps

module tb_logic_gates;
    reg a;
    reg b;
    wire out_and, out_or, out_not, out_xor, out_nand, out_nor, out_xnor;

    logic_gates uut (
        .a(a), .b(b),
        .out_and(out_and), .out_or(out_or), .out_not(out_not),
        .out_xor(out_xor), .out_nand(out_nand), .out_nor(out_nor), .out_xnor(out_xnor)
    );

    initial begin
        $dumpfile("dump.vcd");
        $dumpvars(0, tb_logic_gates);

        $display("Time | A B | AND OR NOT XOR NAND NOR XNOR");
        $monitor("%4t | %b %b |  %b   %b   %b   %b    %b    %b    %b",
                 $time, a, b, out_and, out_or, out_not, out_xor, out_nand, out_nor, out_xnor);

        a = 0; b = 0; #10;
        a = 0; b = 1; #10;
        a = 1; b = 0; #10;
        a = 1; b = 1; #10;

        $finish;
    end
endmodule
""",
        "expected_output": "Time | A B | AND OR NOT XOR NAND NOR XNOR\n   0 | 0 0 |  0   0   1   0    1    1    1\n  10 | 0 1 |  0   1   1   1    1    0    0\n  20 | 1 0 |  0   1   0   1    1    0    0\n  30 | 1 1 |  1   1   0   0    0    0    1",
        "expected_waveform_desc": "Waveforms show logic levels changing every 10ns matching the boolean truth table.",
        "result_explanation": "All 7 gate logic expressions verified against formal truth tables.",
        "conclusion": "Primitive logic gate behavior verified in simulation.",
        "tags": ["combinational", "logic-gates", "truth-table"]
    },
    {
        "id": "vlog-02",
        "title": "Half Adder Circuit",
        "category": "verilog",
        "objective": "Implement and simulate a 1-bit half adder computing Sum and Carry.",
        "required_software": "Icarus Verilog 12.0 + VVP Engine",
        "theory": "A half adder adds two 1-bit binary inputs A and B. Sum = A XOR B, Carry = A AND B.",
        "procedure": [
            "Write Verilog module half_adder.",
            "Write testbench applying input vectors (0,0), (0,1), (1,0), (1,1).",
            "Simulate and view VCD waveforms."
        ],
        "sample_code": """module half_adder (
    input wire a,
    input wire b,
    output wire sum,
    output wire carry
);
    assign sum   = a ^ b;
    assign carry = a & b;
endmodule
""",
        "sample_testbench": """`timescale 1ns / 1ps

module tb_half_adder;
    reg a;
    reg b;
    wire sum;
    wire carry;

    half_adder uut (.a(a), .b(b), .sum(sum), .carry(carry));

    initial begin
        $dumpfile("dump.vcd");
        $dumpvars(0, tb_half_adder);

        $display("Time | A B | Sum Carry");
        $monitor("%4t | %b %b |  %b     %b", $time, a, b, sum, carry);

        a = 0; b = 0; #10;
        a = 0; b = 1; #10;
        a = 1; b = 0; #10;
        a = 1; b = 1; #10;

        $finish;
    end
endmodule
""",
        "expected_output": "Time | A B | Sum Carry\n   0 | 0 0 |  0     0\n  10 | 0 1 |  1     0\n  20 | 1 0 |  1     0\n  30 | 1 1 |  0     1",
        "expected_waveform_desc": "Sum pulse high for inputs 01 and 10; Carry high only at 11.",
        "result_explanation": "1-bit addition arithmetic produces correct sum and carry without ripple.",
        "conclusion": "Half adder combinational logic verified.",
        "tags": ["arithmetic", "adder", "half-adder"]
    },
    {
        "id": "vlog-03",
        "title": "Full Adder Circuit",
        "category": "verilog",
        "objective": "Implement a 1-bit full adder supporting carry-in Cin and generating carry-out Cout.",
        "required_software": "Icarus Verilog 12.0 + VVP Engine",
        "theory": "Full adder computes Sum = A ^ B ^ Cin, and Cout = (A & B) | (Cin & (A ^ B)).",
        "procedure": [
            "Create full_adder module with inputs A, B, Cin and outputs Sum, Cout.",
            "Exhaustively test all 8 input combinations from 000 to 111."
        ],
        "sample_code": """module full_adder (
    input wire a,
    input wire b,
    input wire cin,
    output wire sum,
    output wire cout
);
    assign sum  = a ^ b ^ cin;
    assign cout = (a & b) | (cin & (a ^ b));
endmodule
""",
        "sample_testbench": """`timescale 1ns / 1ps

module tb_full_adder;
    reg a, b, cin;
    wire sum, cout;

    full_adder uut (.a(a), .b(b), .cin(cin), .sum(sum), .cout(cout));

    initial begin
        $dumpfile("dump.vcd");
        $dumpvars(0, tb_full_adder);

        $display("Time | A B Cin | Sum Cout");
        $monitor("%4t | %b %b  %b  |  %b    %b", $time, a, b, cin, sum, cout);

        {a, b, cin} = 3'b000; #10;
        {a, b, cin} = 3'b001; #10;
        {a, b, cin} = 3'b010; #10;
        {a, b, cin} = 3'b011; #10;
        {a, b, cin} = 3'b100; #10;
        {a, b, cin} = 3'b101; #10;
        {a, b, cin} = 3'b110; #10;
        {a, b, cin} = 3'b111; #10;

        $finish;
    end
endmodule
""",
        "expected_output": "Time | A B Cin | Sum Cout\n   0 | 0 0  0  |  0    0\n  10 | 0 0  1  |  1    0\n  20 | 0 1  0  |  1    0\n  30 | 0 1  1  |  0    1\n  40 | 1 0  0  |  1    0\n  50 | 1 0  1  |  0    1\n  60 | 1 1  0  |  0    1\n  70 | 1 1  1  |  1    1",
        "expected_waveform_desc": "Outputs match binary summation across all 8 combinations.",
        "result_explanation": "When all inputs are 1 (1+1+1), Sum=1 and Cout=1 (binary 11 = decimal 3).",
        "conclusion": "Full adder logic completely verified.",
        "tags": ["adder", "full-adder", "combinational"]
    },
    {
        "id": "vlog-04",
        "title": "4-to-1 Multiplexer (MUX)",
        "category": "verilog",
        "objective": "Design and simulate a 4:1 multiplexer using behavioral case construct.",
        "required_software": "Icarus Verilog 12.0 + VVP Engine",
        "theory": "A multiplexer routes one of multiple data inputs to a single output line based on select lines. For 4 inputs, 2 select bits sel[1:0] are required.",
        "procedure": [
            "Design 4-to-1 MUX with inputs in[3:0], sel[1:0] and output out.",
            "Cycle through select values 00, 01, 10, 11."
        ],
        "sample_code": """module mux4to1 (
    input wire [3:0] in,
    input wire [1:0] sel,
    output reg out
);
    always @(*) begin
        case (sel)
            2'b00: out = in[0];
            2'b01: out = in[1];
            2'b10: out = in[2];
            2'b11: out = in[3];
            default: out = 1'b0;
        endcase
    end
endmodule
""",
        "sample_testbench": """`timescale 1ns / 1ps

module tb_mux4to1;
    reg [3:0] in;
    reg [1:0] sel;
    wire out;

    mux4to1 uut (.in(in), .sel(sel), .out(out));

    initial begin
        $dumpfile("dump.vcd");
        $dumpvars(0, tb_mux4to1);

        in = 4'b1010; // in[3]=1, in[2]=0, in[1]=1, in[0]=0

        $monitor("Time=%0t sel=%b in=%b -> out=%b", $time, sel, in, out);

        sel = 2'b00; #10;
        sel = 2'b01; #10;
        sel = 2'b10; #10;
        sel = 2'b11; #10;

        $finish;
    end
endmodule
""",
        "expected_output": "Time=0 sel=00 in=1010 -> out=0\nTime=10 sel=01 in=1010 -> out=1\nTime=20 sel=10 in=1010 -> out=0\nTime=30 sel=11 in=1010 -> out=1",
        "expected_waveform_desc": "Output matches selected bit in sequence 0 -> 1 -> 0 -> 1.",
        "result_explanation": "Behavioral multiplexing verified.",
        "conclusion": "4:1 MUX successfully routed inputs according to select lines.",
        "tags": ["mux", "data-routing", "multiplexer"]
    },
    {
        "id": "vlog-05",
        "title": "2-to-4 Line Decoder with Enable",
        "category": "verilog",
        "objective": "Implement an active-high 2-to-4 binary decoder with enable signal.",
        "required_software": "Icarus Verilog 12.0 + VVP Engine",
        "theory": "A decoder activates exactly one of 2^N output lines based on N input bits when enable is asserted.",
        "procedure": [
            "Declare 2-to-4 decoder with enable en, in[1:0] and out[3:0].",
            "Verify that en=0 forces out=0000.",
            "Verify one-hot output decoding when en=1."
        ],
        "sample_code": """module decoder2to4 (
    input wire en,
    input wire [1:0] in,
    output reg [3:0] out
);
    always @(*) begin
        if (!en)
            out = 4'b0000;
        else begin
            case (in)
                2'b00: out = 4'b0001;
                2'b01: out = 4'b0010;
                2'b10: out = 4'b0100;
                2'b11: out = 4'b1000;
            endcase
        end
    end
endmodule
""",
        "sample_testbench": """`timescale 1ns / 1ps

module tb_decoder2to4;
    reg en;
    reg [1:0] in;
    wire [3:0] out;

    decoder2to4 uut (.en(en), .in(in), .out(out));

    initial begin
        $dumpfile("dump.vcd");
        $dumpvars(0, tb_decoder2to4);

        $monitor("Time=%0t en=%b in=%b -> out=%b", $time, en, in, out);

        en = 0; in = 2'b11; #10; // Disabled
        en = 1; in = 2'b00; #10;
        in = 2'b01; #10;
        in = 2'b10; #10;
        in = 2'b11; #10;

        $finish;
    end
endmodule
""",
        "expected_output": "Time=0 en=0 in=11 -> out=0000\nTime=10 en=1 in=00 -> out=0001\nTime=20 en=1 in=01 -> out=0010\nTime=30 en=1 in=10 -> out=0100\nTime=40 en=1 in=11 -> out=1000",
        "expected_waveform_desc": "One-hot walking bit pattern across out[3:0].",
        "result_explanation": "One-hot decoding verified.",
        "conclusion": "2-to-4 decoder functionality verified.",
        "tags": ["decoder", "one-hot", "combinational"]
    },
    {
        "id": "vlog-06",
        "title": "Positive Edge-Triggered D Flip-Flop",
        "category": "verilog",
        "objective": "Design an edge-triggered D flip-flop with asynchronous reset.",
        "required_software": "Icarus Verilog 12.0 + VVP Engine",
        "theory": "Flip-flops are fundamental bistable memory storage elements. Output Q samples input D only on posedge clk, unless reset is asserted.",
        "procedure": [
            "Write sequential always @(posedge clk or posedge reset) block.",
            "Generate periodic clock in testbench.",
            "Assert reset, release, and toggle input D."
        ],
        "sample_code": """module d_flip_flop (
    input wire clk,
    input wire reset,
    input wire d,
    output reg q,
    output wire q_bar
);
    assign q_bar = ~q;

    always @(posedge clk or posedge reset) begin
        if (reset)
            q <= 1'b0;
        else
            q <= d;
    end
endmodule
""",
        "sample_testbench": """`timescale 1ns / 1ps

module tb_d_flip_flop;
    reg clk, reset, d;
    wire q, q_bar;

    d_flip_flop uut (.clk(clk), .reset(reset), .d(d), .q(q), .q_bar(q_bar));

    always #5 clk = ~clk; // 10ns period

    initial begin
        $dumpfile("dump.vcd");
        $dumpvars(0, tb_d_flip_flop);

        clk = 0; reset = 1; d = 0;
        #12 reset = 0;

        #8  d = 1;
        #10 d = 0;
        #10 d = 1;
        #15 reset = 1; #5 reset = 0;
        #10 $finish;
    end

    initial begin
        $monitor("Time=%0t | clk=%b rst=%b d=%b | q=%b q_bar=%b", $time, clk, reset, d, q, q_bar);
    end
endmodule
""",
        "expected_output": "Sequential state transitions occurring cleanly on positive clock edges.",
        "expected_waveform_desc": "Q captures D on rising clock edges and clears immediately when reset is asserted.",
        "result_explanation": "Edge-triggered sequential storage confirmed.",
        "conclusion": "D flip-flop with asynchronous reset verified.",
        "tags": ["sequential", "flip-flop", "dff", "memory"]
    },
    {
        "id": "vlog-07",
        "title": "4-Bit Synchronous Up Counter with Reset",
        "category": "verilog",
        "objective": "Build and verify a 4-bit binary synchronous up counter with active-high reset.",
        "required_software": "Icarus Verilog 12.0 + VVP Engine",
        "theory": "A 4-bit synchronous counter increments from 0000 to 1111 (0 to 15) on each positive clock edge and rolls over back to 0000.",
        "procedure": [
            "Implement counter4 module using count <= count + 1'b1.",
            "Simulate for 16 clock cycles.",
            "Verify incremental sequence and VCD waveform output."
        ],
        "sample_code": """module counter4 (
    input wire clk,
    input wire reset,
    output reg [3:0] count
);
    always @(posedge clk or posedge reset) begin
        if (reset)
            count <= 4'b0000;
        else
            count <= count + 1'b1;
    end
endmodule
""",
        "sample_testbench": """`timescale 1ns / 1ps

module tb_counter4;
    reg clk;
    reg reset;
    wire [3:0] count;

    counter4 uut (
        .clk(clk),
        .reset(reset),
        .count(count)
    );

    always #5 clk = ~clk; // 10ns clock period

    initial begin
        $dumpfile("dump.vcd");
        $dumpvars(0, tb_counter4);

        clk = 0;
        reset = 1;
        #12 reset = 0;

        // Run for 100ns (10 full clock cycles)
        #100;
        $finish;
    end

    initial begin
        $monitor("Time=%0t | clk=%b reset=%b | count=%b (%0d)",
                 $time, clk, reset, count, count);
    end
endmodule
""",
        "expected_output": "Time=0 | clk=0 reset=1 | count=0000 (0)\nTime=15 | clk=1 reset=0 | count=0001 (1)\nTime=25 | clk=1 reset=0 | count=0010 (2)\nTime=35 | clk=1 reset=0 | count=0011 (3)",
        "expected_waveform_desc": "Clock pulses, reset drops low at 12ns, and count increments 0 -> 1 -> 2 -> 3 ... 9.",
        "result_explanation": "Count registers update synchronously on posedge clk.",
        "conclusion": "4-bit synchronous counter behavior verified.",
        "tags": ["counter", "sequential", "clocked", "up-counter"]
    },
    {
        "id": "vlog-08",
        "title": "4-Bit Serial-In Parallel-Out (SIPO) Shift Register",
        "category": "verilog",
        "objective": "Design a 4-bit SIPO shift register demonstrating serial data conversion to parallel bus.",
        "required_software": "Icarus Verilog 12.0 + VVP Engine",
        "theory": "On each clock pulse, data shifts right by 1 bit: q <= {serial_in, q[3:1]}.",
        "procedure": [
            "Declare shift register with serial input din, clk, rst and parallel output q[3:0].",
            "Shift 4 serial bits into the register.",
            "Verify parallel bus output."
        ],
        "sample_code": """module shift_reg_sipo (
    input wire clk,
    input wire reset,
    input wire din,
    output reg [3:0] q
);
    always @(posedge clk or posedge reset) begin
        if (reset)
            q <= 4'b0000;
        else
            q <= {din, q[3:1]};
    end
endmodule
""",
        "sample_testbench": """`timescale 1ns / 1ps

module tb_shift_reg_sipo;
    reg clk, reset, din;
    wire [3:0] q;

    shift_reg_sipo uut (.clk(clk), .reset(reset), .din(din), .q(q));

    always #5 clk = ~clk;

    initial begin
        $dumpfile("dump.vcd");
        $dumpvars(0, tb_shift_reg_sipo);

        clk = 0; reset = 1; din = 0;
        #12 reset = 0;

        // Shift in bit sequence: 1, 1, 0, 1
        din = 1; #10;
        din = 1; #10;
        din = 0; #10;
        din = 1; #10;
        #20;
        $finish;
    end

    initial begin
        $monitor("Time=%0t | din=%b | q=%b", $time, din, q);
    end
endmodule
""",
        "expected_output": "Serial input bits shifted right sequentially across 4 clock cycles.",
        "expected_waveform_desc": "Parallel bus q shows bits propagating through registers.",
        "result_explanation": "Demonstrates serial-to-parallel conversion commonly used in UART and SPI communications.",
        "conclusion": "SIPO shift register verified.",
        "tags": ["shift-register", "sipo", "serial-parallel"]
    },
    {
        "id": "vlog-09",
        "title": "4-Bit Magnitude Comparator",
        "category": "verilog",
        "objective": "Design and verify a 4-bit digital magnitude comparator reporting Greater Than, Equal To, and Less Than.",
        "required_software": "Icarus Verilog 12.0 + VVP Engine",
        "theory": "Compares two unsigned 4-bit words A and B. Evaluates A > B, A == B, and A < B.",
        "procedure": [
            "Design comparator with inputs A[3:0], B[3:0] and flags A_gt_B, A_eq_B, A_lt_B.",
            "Test cases where A > B, A == B, and A < B."
        ],
        "sample_code": """module comparator4 (
    input wire [3:0] a,
    input wire [3:0] b,
    output wire a_gt_b,
    output wire a_eq_b,
    output wire a_lt_b
);
    assign a_gt_b = (a > b);
    assign a_eq_b = (a == b);
    assign a_lt_b = (a < b);
endmodule
""",
        "sample_testbench": """`timescale 1ns / 1ps

module tb_comparator4;
    reg [3:0] a, b;
    wire a_gt_b, a_eq_b, a_lt_b;

    comparator4 uut (.a(a), .b(b), .a_gt_b(a_gt_b), .a_eq_b(a_eq_b), .a_lt_b(a_lt_b));

    initial begin
        $dumpfile("dump.vcd");
        $dumpvars(0, tb_comparator4);

        $display("Time | A   B  | GT EQ LT");
        $monitor("%4t | %0d  %0d  |  %b  %b  %b", $time, a, b, a_gt_b, a_eq_b, a_lt_b);

        a = 4'd5; b = 4'd5; #10; // Equal
        a = 4'd9; b = 4'd3; #10; // Greater
        a = 4'd2; b = 4'd7; #10; // Less
        a = 4'd15; b = 4'd15; #10; // Equal max
        $finish;
    end
endmodule
""",
        "expected_output": "Time | A   B  | GT EQ LT\n   0 | 5  5  |  0  1  0\n  10 | 9  3  |  1  0  0\n  20 | 2  7  |  0  0  1\n  30 | 15  15  |  0  1  0",
        "expected_waveform_desc": "Outputs assert mutually exclusive comparison flags.",
        "result_explanation": "Relational operators in Verilog produce proper binary comparison flags.",
        "conclusion": "4-bit magnitude comparator verified.",
        "tags": ["comparator", "relational", "arithmetic"]
    },
    {
        "id": "vlog-10",
        "title": "Finite-State Machine (FSM): Sequence Detector (101)",
        "category": "verilog",
        "objective": "Implement a Moore/Mealy Finite-State Machine detecting the overlapping sequence '101'.",
        "required_software": "Icarus Verilog 12.0 + VVP Engine",
        "theory": "FSMs consist of states (IDLE, GOT_1, GOT_10) and transition on clock edges. The detector asserts output high when sequence 1-0-1 is recognized.",
        "procedure": [
            "Define state parameters S_IDLE, S_1, S_10.",
            "Write state register always block and next-state logic block.",
            "Provide test bitstream and verify detection flag in waveform."
        ],
        "sample_code": """module seq_detector_101 (
    input wire clk,
    input wire reset,
    input wire din,
    output reg detected
);
    parameter S_IDLE = 2'b00,
              S_1    = 2'b01,
              S_10   = 2'b10;

    reg [1:0] state, next_state;

    // State register
    always @(posedge clk or posedge reset) begin
        if (reset)
            state <= S_IDLE;
        else
            state <= next_state;
    end

    // Next-state logic & output
    always @(*) begin
        detected = 1'b0;
        next_state = state;
        case (state)
            S_IDLE: begin
                if (din) next_state = S_1;
            end
            S_1: begin
                if (!din) next_state = S_10;
                else next_state = S_1;
            end
            S_10: begin
                if (din) begin
                    detected = 1'b1; // Sequence 1-0-1 detected!
                    next_state = S_1; // Overlapping sequence allowed
                end else begin
                    next_state = S_IDLE;
                end
            end
            default: next_state = S_IDLE;
        endcase
    end
endmodule
""",
        "sample_testbench": """`timescale 1ns / 1ps

module tb_seq_detector;
    reg clk, reset, din;
    wire detected;

    seq_detector_101 uut (.clk(clk), .reset(reset), .din(din), .detected(detected));

    always #5 clk = ~clk;

    initial begin
        $dumpfile("dump.vcd");
        $dumpvars(0, tb_seq_detector);

        clk = 0; reset = 1; din = 0;
        #12 reset = 0;

        // Bitstream: 1 -> 0 -> 1 (detect!) -> 0 -> 1 (detect overlapping!) -> 0
        din = 1; #10;
        din = 0; #10;
        din = 1; #10;
        din = 0; #10;
        din = 1; #10;
        din = 0; #10;

        #20 $finish;
    end

    initial begin
        $monitor("Time=%0t | din=%b | detected=%b", $time, din, detected);
    end
endmodule
""",
        "expected_output": "Sequence detected flag goes high upon arrival of 1-0-1 pattern.",
        "expected_waveform_desc": "detected signal pulses high at times matching '101' pattern matches.",
        "result_explanation": "State machine transitions through S_IDLE -> S_1 -> S_10 and activates detected upon reaching final 1.",
        "conclusion": "Finite-state machine sequence detector successfully simulated.",
        "tags": ["fsm", "sequence-detector", "mealy", "state-machine"]
    }
]

class ExperimentService:
    @staticmethod
    def get_all_experiments(category: Optional[str] = None) -> List[Dict[str, Any]]:
        if category:
            return [e for e in EXPERIMENTS_DATABASE if e["category"].lower() == category.lower()]
        return EXPERIMENTS_DATABASE

    @staticmethod
    def get_experiment_by_id(exp_id: str) -> Optional[Dict[str, Any]]:
        return next((e for e in EXPERIMENTS_DATABASE if e["id"] == exp_id), None)
