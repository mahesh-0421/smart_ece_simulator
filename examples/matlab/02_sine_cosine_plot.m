% Example 2: Continuous Sine and Cosine Plotting
% Smart ECE Lab - GNU Octave Compatible

t = 0:0.01:2;
f = 1; % 1 Hz frequency

y1 = sin(2 * pi * f * t);
y2 = cos(2 * pi * f * t);

figure(1);
plot(t, y1, 'b-', 'LineWidth', 2);
hold on;
plot(t, y2, 'r--', 'LineWidth', 2);
hold off;

grid on;
title('Harmonic Oscillations (1 Hz)');
xlabel('Time (seconds)');
ylabel('Amplitude');
legend('Sine wave: sin(2\\pi f t)', 'Cosine wave: cos(2\\pi f t)');

disp('Plot generated and exported successfully.');
