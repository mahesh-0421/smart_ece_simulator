% Example 1: Arithmetic and Matrix Operations
% Smart ECE Lab - GNU Octave Compatible

A = [2, 4, 6; 1, 3, 5; 0, 8, 2];
B = [1, 0, 0; 0, 1, 0; 0, 0, 1]; % Identity matrix

disp('Matrix A:');
disp(A);

disp('Matrix B (Identity):');
disp(B);

disp('Matrix Multiplication (A * B):');
disp(A * B);

disp('Determinant det(A):');
disp(det(A));

disp('Matrix Transpose A'':');
disp(A');
