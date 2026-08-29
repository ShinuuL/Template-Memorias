# Primeiros passos — site limpo

> Seu deploy já está no ar. O banco está zerado (sem memórias) — siga esses 4 passos na ordem.

### 1) Entre como admin
Acesse `seusite.vercel.app/login` e entre com:
- **e-mail:** `admin@admin.net`
- **senha:** `Admin#123`
> Troque depois em Supabase > Authentication > Users se quiser.

### 2) Configure a fachada (porta de entrada)
Vá em **Fachada** no menu do admin (`/admin/config`):
- **Pergunta:** ex. `Acerta a data Neném`
- **Resposta:** a senha que o visualizador vai digitar (ex. `2025-07-04` ou `04/07/2025` — digite exatamente como quer que ele acerte)
- **Cor de fundo:** clique no quadrado colorido e escolha. Salve.

Teste como visualizador: abra a fachada (`/`) em aba anônima, digite a resposta e clique **Verificar** — deve liberar `/memorias`.

### 3) Crie a primeira memória
Em **Memórias** (`/admin`) clique **+ Nova memória**:
- **Título** (obrigatório) e **Data** (opcional, ex. `04/07/2025`)
- **Carta:** texto livre (quebra de linha preservada)
- **Aparência:** escolha cores (Fundo/Texto/Destaque/Cartão) e fontes do título e corpo
- **Músicas:** clique **+ Adicionar** e cole o **ID** da faixa do Spotify. Ex.: link `https://open.spotify.com/track/28jyMOvRd82hQp95Z9ftXw` → cole `28jyMOvRd82hQp95Z9ftXw`. Pode adicionar várias.
- **Fotos:** **+ Adicionar da galeria** → selecione do celular/PC (JPG/PNG/WEBP, até 15 MB cada) → arraste para reordenar e escreva legenda se quiser.
- Clique **Salvar**. Ela já aparece em `/memorias`.

### 4) Compartilhe
Envie o link da fachada (`/`) para a outra pessoa. Ela só precisa acertar a resposta — não precisa criar conta. Você continua editando/criando em `/admin`.

---
**Dicas:** memórias sem foto mostram 💌 como capa. Reordene arrastando o `⠿` na lista do admin. Para trocar template por casal, faça um novo deploy com outro projeto Supabase (um por deploy).
