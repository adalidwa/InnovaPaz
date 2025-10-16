export async function uploadCompanyLogo(empresaId: string, file: File, token: string) {
  const formData = new FormData();
  formData.append('logo', file);
  const res = await fetch(`/api/companies/upload/logo/${empresaId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error('No se pudo subir el logo');
  return await res.json();
}
