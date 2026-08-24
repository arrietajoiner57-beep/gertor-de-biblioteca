import { render, screen } from '@testing-library/react';
import App from './App';

test('muestra la pantalla de login cuando no hay sesión', () => {
  render(<App />);
  const boton = screen.getByRole('button', { name: /iniciar sesión/i });
  expect(boton).toBeInTheDocument();
});
