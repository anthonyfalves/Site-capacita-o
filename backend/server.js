// backend/server.js
const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const path    = require('path');

const app = express();

// 1. Parser de JSON e form‐urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Servir todo o frontend (index.html, script.js, styles.css, etc)
app.use(express.static(path.join(__dirname, '../frontend')));

// 3. Servir a pasta de uploads (onde ficará sua imagem do popup)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Configuração do multer para upload
const upload = multer({
  dest: path.join(__dirname, 'uploads/'),
  limits: { fileSize: 5 * 1024 * 1024 }  // até 5MB
});

// 5. Rota API para ler o popup
app.get('/api/popup', (req, res) => {
  const cfgPath = path.join(__dirname, 'popup.json');
  if (!fs.existsSync(cfgPath)) {
    // ainda não configurado
    return res.json({ image: null });
  }
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  res.json({ image: cfg.image });
});

// 6. Página de administração para enviar nova imagem
app.get('/popup', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// 7. Recebe o upload e atualiza o popup.json
app.post('/popup', upload.single('popupImage'), (req, res) => {
  const ext  = path.extname(req.file.originalname);
  const dest = path.join(__dirname, 'uploads/popup' + ext);

  // renomeia para sempre “popup.ext”
  fs.renameSync(req.file.path, dest);

  // salva o JSON de configuração
  const cfg = { image: '/uploads/popup' + ext };
  fs.writeFileSync(path.join(__dirname, 'popup.json'),
                   JSON.stringify(cfg, null, 2));

  res.send('<p>Imagem do popup atualizada!</p><a href="/popup">Voltar</a>');
});

// 8. Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
