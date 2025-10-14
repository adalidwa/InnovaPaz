export const loginToERP = async (email: string, password: string): Promise<any> => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        usuario: data.usuario,
        token: data.token,
      };
    } else {
      const error = await res.json();
      throw new Error(error.message || 'Credenciales incorrectas');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Error de red');
  }
};

export const checkActiveSession = async (): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const res = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data.usuario;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const redirectToMarketing = (path: string) => {
  window.location.href = `https://innovapaz.com${path}`;
};
