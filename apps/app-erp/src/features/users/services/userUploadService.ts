export async function uploadUserAvatar(userId: string, file: File, token: string) {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await fetch(`/api/users/upload/avatar/${userId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error('No se pudo subir el avatar');
  return await res.json();
}
