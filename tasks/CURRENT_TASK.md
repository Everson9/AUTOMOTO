# CURRENT_TASK.md — Tarefa Atual

---

## Fase 1.5, Item 3 — Editar moto + upload de foto real

### Objetivo
Permitir que o usuário edite os dados da moto cadastrada e faça upload de uma foto real da moto.

### Arquivos principais
- `apps/mobile/src/screens/Garagem/GaragemScreen.tsx` — tela da garagem
- `apps/mobile/src/screens/Garagem/useGaragem.ts` — hook de dados
- `apps/mobile/src/screens/EditarMoto/` — nova tela de edição (criar)
- `apps/mobile/app/editar-moto.tsx` — rota de edição (criar)

### Requisitos
1. [ ] Criar tela `EditarMotoScreen` com formulário de edição
2. [ ] Implementar upload de foto usando Supabase Storage
3. [ ] Adicionar botão "Editar" no card da moto na Garagem
4. [ ] Adicionar botão "Editar" no card da moto na Home
5. [ ] Atualizar `useGaragem.ts` com função `atualizarMoto()`
6. [ ] Atualizar `useHome.ts` para refletir mudanças

### Upload de foto
- Bucket: `motos-fotos` no Supabase Storage
- Formato: `{user_id}/{moto_id}.jpg`
- Redimensionar para max 800x800px antes do upload
- Usar `expo-image-picker` para seleção de foto

### Campos editáveis
- Foto da moto
- Modelo (texto)
- Marca (texto)
- Ano (número)
- Cor (texto)
- Placa (texto, apenas visualização ou edição limitada?)

### Critérios de pronto
- [ ] Usuário consegue editar todos os campos da moto
- [ ] Upload de foto funciona com galeria e câmera
- [ ] Foto aparece no card da moto (Home e Garagem)
- [ ] Dados atualizados persistem no Supabase
- [ ] Navegação funciona: Garagem → Editar → Salvar → voltar

### Status
`pendente` — aguardando início