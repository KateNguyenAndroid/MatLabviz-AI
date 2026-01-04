import { FormulaTemplate } from './types';

export const FORMULA_TEMPLATES: FormulaTemplate[] = [
  {
    id: '1',
    name: 'Sine Wave',
    latex: 'y = A \\sin(\\omega t + \\phi)',
    description: 'A mathematical curve that describes a smooth periodic oscillation.',
    category: 'Physics',
    matlabCode: `% Sine Wave Plot
t = linspace(0, 10, 1000); % Time vector
A = 1;      % Amplitude
omega = 2;  % Angular frequency
phi = 0;    % Phase

y = A * sin(omega * t + phi);

figure;
plot(t, y, 'LineWidth', 2);
title('Sine Wave: y = A sin(\\omega t + \\phi)');
xlabel('Time (t)');
ylabel('Amplitude (y)');
grid on;
axis tight;`
  },
  {
    id: '2',
    name: 'Gaussian Function',
    latex: 'f(x) = a e^{-\\frac{(x-b)^2}{2c^2}}',
    description: 'A function that represents the probability density function of a normal distribution.',
    category: 'Statistics',
    matlabCode: `% Gaussian Distribution Plot
x = linspace(-5, 5, 100);
a = 1;    % Height of the curve's peak
b = 0;    % Position of the center of the peak
c = 1;    % Standard deviation

y = a * exp(-((x - b).^2) / (2 * c^2));

figure;
plot(x, y, 'r-', 'LineWidth', 2);
title('Gaussian Function');
xlabel('x');
ylabel('f(x)');
grid on;`
  },
  {
    id: '3',
    name: 'Sigmoid Function',
    latex: 'S(x) = \\frac{1}{1 + e^{-x}}',
    description: 'A characteristic "S"-shaped curve or sigmoid curve.',
    category: 'Algebra',
    matlabCode: `% Sigmoid Function Plot
x = linspace(-10, 10, 100);

S = 1 ./ (1 + exp(-x));

figure;
plot(x, S, 'b-', 'LineWidth', 2);
title('Sigmoid Function');
xlabel('Input (x)');
ylabel('Activation (S)');
grid on;
ylim([-0.1 1.1]);`
  },
  {
    id: '4',
    name: 'Lorenz Attractor',
    latex: '\\frac{dx}{dt} = \\sigma(y-x), \\frac{dy}{dt} = x(\\rho-z)-y, \\frac{dz}{dt} = xy-\\beta z',
    description: 'A set of chaotic solutions to the Lorenz system.',
    category: 'Physics',
    matlabCode: `% Lorenz Attractor Simulation
sigma = 10;
beta = 8/3;
rho = 28;

tspan = [0 50];
x0 = [1; 1; 1];

[t, x] = ode45(@(t,x) lorenz(t, x, sigma, rho, beta), tspan, x0);

figure;
plot3(x(:,1), x(:,2), x(:,3));
title('Lorenz Attractor');
xlabel('x'); ylabel('y'); zlabel('z');
grid on;
view(45, 45);

function dxdt = lorenz(~, x, sigma, rho, beta)
    dxdt = [sigma*(x(2)-x(1));
            x(1)*(rho-x(3))-x(2);
            x(1)*x(2)-beta*x(3)];
end`
  },
  {
    id: '5',
    name: 'Fourier Series (Square Wave)',
    latex: 'x(t) = \\frac{4}{\\pi} \\sum_{n=1,3,5...}^{\\infty} \\frac{1}{n} \\sin(n \\pi t)',
    description: 'Approximating a square wave using a sum of sine waves.',
    category: 'Calculus',
    matlabCode: `% Fourier Series Approximation of Square Wave
t = linspace(0, 4, 1000);
y = zeros(size(t));
N = 10; % Number of harmonics

for n = 1:2:2*N
    y = y + (4/pi) * (1/n) * sin(n * pi * t);
end

figure;
plot(t, y, 'LineWidth', 1.5);
title(['Fourier Series Square Wave (N=', num2str(N), ')']);
xlabel('Time');
ylabel('Amplitude');
grid on;`
  }
];