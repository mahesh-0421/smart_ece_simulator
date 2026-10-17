% Example 3: Fast Fourier Transform (FFT) Amplitude Spectrum
% Smart ECE Lab - GNU Octave Compatible

Fs = 500;             % 500 Hz sampling rate
T = 1/Fs;
L = 1000;             % Signal length
t = (0:L-1)*T;

% Composite signal with 15 Hz and 60 Hz tones
S = 0.8 * sin(2*pi*15*t) + 1.5 * sin(2*pi*60*t);

Y = fft(S);
P2 = abs(Y/L);
P1 = P2(1:L/2+1);
P1(2:end-1) = 2*P1(2:end-1);
f_axis = Fs*(0:(L/2))/L;

figure(1);
plot(f_axis, P1, 'k-', 'LineWidth', 1.5);
grid on;
title('Single-Sided Frequency Spectrum |P1(f)|');
xlabel('Frequency (Hz)');
ylabel('Spectral Amplitude');

disp('FFT spectrum evaluated.');
