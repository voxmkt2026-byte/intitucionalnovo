-- Dados fictícios para o banco de Preview; use o caminho retornado no domínio do deploy.
INSERT INTO prospects
  (token, empresa, contato_nome, segmento, credito, prazo_meses, plano, whatsapp_consultor, consultor_nome, expira_em)
VALUES
  ('zqhMhhvPZBuVeVf8MuDLQkTHwPk6_taz', 'Transportadora Exemplo', 'Ana', 'veiculo', 200000, 80, 'titanium', '5545999999999', 'Eduardo', NOW() + INTERVAL '7 days')
RETURNING '/s/' || token || '/' AS caminho;
