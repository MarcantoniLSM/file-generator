type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "user";
  access_status: "active" | "blocked";
  created_at: string;
};

export function AdminUsersTable({
  profiles,
  currentUserId
}: {
  profiles: Profile[];
  currentUserId: string | undefined;
}) {
  return (
    <div className="border border-line bg-white">
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-bold">Usuários cadastrados</h2>
        <p className="mt-1 text-sm text-muted">Altere papel e status de acesso dos usuários da plataforma.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-paper text-muted">
            <tr>
              <th className="border-b border-line px-4 py-3 font-semibold">Usuário</th>
              <th className="border-b border-line px-4 py-3 font-semibold">Papel</th>
              <th className="border-b border-line px-4 py-3 font-semibold">Acesso</th>
              <th className="border-b border-line px-4 py-3 font-semibold">Cadastro</th>
              <th className="border-b border-line px-4 py-3 font-semibold">Ação</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => {
              const isSelf = profile.id === currentUserId;

              return (
                <tr key={profile.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{profile.full_name || "Sem nome"}</p>
                    <p className="text-muted">{profile.email}</p>
                    {isSelf ? <p className="mt-1 text-xs text-civic">Você</p> : null}
                  </td>
                  <td className="px-4 py-3">
                    <span>{profile.role === "admin" ? "Admin" : "Usuário"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span>{profile.access_status === "active" ? "Ativo" : "Bloqueado"}</span>
                  </td>
                  <td className="px-4 py-3 text-muted">{new Date(profile.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3">
                    <form action="/admin/usuarios/atualizar" method="post" className="flex items-center gap-2">
                      <input type="hidden" name="id" value={profile.id} />
                      <select
                        name="role"
                        defaultValue={profile.role}
                        disabled={isSelf}
                        className="border border-line bg-white px-2 py-2 disabled:bg-paper disabled:text-muted"
                      >
                        <option value="user">Usuário</option>
                        <option value="admin">Admin</option>
                      </select>
                      <select
                        name="access_status"
                        defaultValue={profile.access_status}
                        disabled={isSelf}
                        className="border border-line bg-white px-2 py-2 disabled:bg-paper disabled:text-muted"
                      >
                        <option value="active">Ativo</option>
                        <option value="blocked">Bloqueado</option>
                      </select>
                      <button
                        type="submit"
                        disabled={isSelf}
                        className="bg-civic px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        Salvar
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
