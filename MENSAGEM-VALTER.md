# Mensagens para o Valter

Configuração do GitHub que só o dono do repositório (`SgtCastanheira/biblia-sagrada`) pode fazer: deixar a `dev` como branch padrão e proteger a `main`. São dois caminhos; basta um deles.

- **Mensagem 1:** para o Valter fazer pelos menus do GitHub.
- **Mensagem 2:** para o Valter colar no Claude Code dele, que faz a configuração pela linha de comando.

---

## Mensagem 1 — passo a passo pelo GitHub

```
Fala, Valter! Tudo certo?

Estou ajudando no app da Bíblia e fiz umas mudanças para proteger o site que está no ar. Só que algumas configurações só o dono do repositório consegue fazer no GitHub, então preciso de você. Leva uns 5 minutos.

O QUE MUDOU (já está no GitHub):
- Agora temos duas branches:
  • main = PRODUÇÃO (o site no ar). Tudo que entra nela é publicado.
  • dev = DESENVOLVIMENTO. É onde a gente trabalha e testa antes de publicar.
- Antes de publicar, o GitHub agora roda os testes e o linter sozinho. Se algo falhar, o site não é atualizado e continua na versão que funcionava.
- Os dados dos usuários (sermões, anotações) ficaram mais protegidos: o app avisa quando não consegue salvar, e restaurar um backup não apaga mais nada se der errado.
- Os detalhes estão no README (seção "Branches") e no arquivo DIARIO.md.

O QUE VOCÊ PRECISA FAZER NO GITHUB:
Abra https://github.com/SgtCastanheira/biblia-sagrada e clique em Settings (a engrenagem, no alto).

1) Deixar a dev como branch padrão
   - Settings › General › seção "Default branch"
   - Clique no ícone de setas ao lado de "main", escolha "dev" e confirme em "Update".

2) Proteger a main
   - Settings › Branches › "Add branch protection rule" (ou "Add classic branch protection rule")
   - Em "Branch name pattern", escreva: main
   - Marque:
     ☑ Require a pull request before merging
         (desmarque "Require approvals", senão você não consegue aprovar o seu próprio PR)
     ☑ Require status checks to pass before merging
         → na busca, digite "testes" e selecione o check "testes"
     ☑ Do not allow bypassing the above settings
         (sem isso, você, como dono, ainda conseguiria mandar direto para a main por engano)
   - Deixe DESMARCADOS "Allow force pushes" e "Allow deletions".
   - Clique em "Create".

   Se o check "testes" não aparecer na busca: abra a aba Actions, veja se o workflow "Testes" já rodou pelo menos uma vez na dev e tente de novo.

DEPOIS DISSO, O JEITO DE TRABALHAR MUDA:
- No seu computador, rode uma vez:
    git fetch
    git switch dev
- Trabalhe sempre na dev (ou peça para o Claude trabalhar na dev).
- Quando quiser publicar: no GitHub, abra um Pull Request da dev para a main. Quando os testes ficarem verdes, clique em "Merge". O site é publicado sozinho.
- Não dá mais para mandar direto para a main. É de propósito.

Se preferir que eu mesmo cuide dessas configurações, é só me dar permissão de Admin no repositório (Settings › Collaborators) que eu faço.

Valeu!
```

---

## Mensagem 2 — para colar no Claude Code do Valter

Abrir o Claude Code na pasta do projeto e colar:

````
Preciso configurar o repositório SgtCastanheira/biblia-sagrada no GitHub. Sou o dono dele.
O contexto está no README (seção "Branches") e no DIARIO.md: a main é produção, e a dev é a branch de desenvolvimento e homologação.
Antes de cada passo, me mostre o comando e espere eu confirmar.

1. Confira se o gh está logado com a minha conta e se tenho permissão de admin:
   gh auth status
   gh api repos/SgtCastanheira/biblia-sagrada --jq .permissions.admin
   (precisa responder true; se o gh não estiver logado, me peça para rodar "! gh auth login")

2. Confira se o workflow "Testes" já rodou na dev e passou:
   gh run list --workflow=testes.yml --branch dev --limit 3
   Se falhou, me mostre o erro e pare aqui.

3. Deixe a dev como branch padrão:
   gh repo edit SgtCastanheira/biblia-sagrada --default-branch dev

4. Proteja a main: só por pull request (sem exigir aprovação), com o check "testes" obrigatório,
   valendo também para mim como admin, e sem force push nem exclusão:
   gh api -X PUT repos/SgtCastanheira/biblia-sagrada/branches/main/protection --input - <<'EOF'
   {
     "required_status_checks": { "strict": false, "contexts": ["testes"] },
     "enforce_admins": true,
     "required_pull_request_reviews": { "required_approving_review_count": 0 },
     "restrictions": null,
     "allow_force_pushes": false,
     "allow_deletions": false
   }
   EOF

5. Verifique se ficou certo e me mostre o resultado:
   gh repo view SgtCastanheira/biblia-sagrada --json defaultBranchRef --jq .defaultBranchRef.name
   gh api repos/SgtCastanheira/biblia-sagrada/branches/main/protection --jq "{checks: .required_status_checks.contexts, admins: .enforce_admins.enabled, pr: (.required_pull_request_reviews != null), force_push: .allow_force_pushes.enabled}"
   (o esperado: dev; checks ["testes"], admins true, pr true, force_push false)

6. Deixe o meu clone local na dev:
   git fetch
   git switch dev

7. Registre a configuração no DIARIO.md, seguindo a regra do CLAUDE.md, e faça o commit na dev.
   Não mande nada para a main.
````

### Escolhas nos comandos

- `required_approving_review_count: 0`: exige o pull request, mas não aprovação; assim o Valter consegue fazer merge do próprio PR. Se quiserem que um revise o trabalho do outro, troque por `1`.
- `strict: false`: a `main` não exige que o PR esteja atualizado com ela. Com `true`, cada merge da `dev` para a `main` cria um commit que obrigaria a atualizar a `dev` antes do PR seguinte.
- `enforce_admins: true`: a regra vale também para o dono, que de outro modo ainda conseguiria mandar direto para a `main` por engano.
- O passo 2 vem antes da proteção: o check `testes` só existe depois de rodar uma vez. Criar a regra antes faria a `main` esperar por um check que nunca aparece.
- Os comandos não foram testados no repositório (sem login de administrador nesta máquina); o passo 5 confere se tudo ficou certo.
