export async function getTruoraResult(processId: string) {
  const res = await fetch(
    `https://api.identity.truora.com/v1/processes/${processId}/result`,
    {
      headers: {
        "Truora-API-Key": "TU_API_KEY",
      },
    }
  );

  return res.json();
}