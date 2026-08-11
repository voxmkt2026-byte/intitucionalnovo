# WhatsApp Planilha Enricher

## Como usar

1. Coloque uma planilha `.xlsx`, `.xls` ou `.csv` na pasta `input`.
2. Dê dois cliques em `INICIAR.bat`.
3. Na primeira execução, conecte o WhatsApp Web pelo QR Code.
4. Ao terminar, abra a planilha criada na pasta `output`.

O primeiro início demora alguns minutos porque o programa instala sozinho o ambiente. Ele usa o Google Chrome ou Microsoft Edge já instalado no Windows, sem baixar outro navegador. A sessão do WhatsApp fica salva localmente em `whatsapp-profile`, portanto não compartilhe essa pasta.

O programa não altera o arquivo original. Ele cria as colunas `telefone_normalizado`, `nome_whatsapp`, `possui_whatsapp`, `status_consulta` e `consultado_em`. Se for interrompido, salva o progresso e continua na próxima execução.

Use somente números que você esteja autorizado a consultar. O resultado é o identificador que o WhatsApp Web disponibiliza para a conta conectada; ele pode ser um nome, apenas o número, ou nenhuma informação útil. Mudanças futuras na interface do WhatsApp podem exigir ajuste do programa.
