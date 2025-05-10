const fetch = require('node-fetch');
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

// 🔐 当前有效的 cookie/token（初始为空）
let COOKIE = '';
let TOKEN = '';

// ✅ 设置 cookie/token 接口
app.post('/api/set-auth', (req, res) => {
  const { cookie, token } = req.body;
  if (cookie) COOKIE = cookie;
  if (token) TOKEN = token;
  console.log('[✅已接收认证]', COOKIE, TOKEN);
  res.json({ success: true });
});

// ✅ 检查是否有效（例如用服务器列表接口验证）
app.get('/api/auth-check', async (req, res) => {
  const url = 'https://api.52108.com/api/services/cbg/GameServer/GetOther?OperatorId=2962&GameInfoId=23';
  try {
    const response = await fetch(url, {
      headers: {
        cookie: COOKIE,
        authorization: TOKEN,
        origin: 'https://dms.haodatang.com',
        referer: 'https://dms.haodatang.com/',
      }
    });
    const data = await response.json();
    if (data.success) {
      res.json({ success: true, message: 'Cookie有效' });
    } else {
      res.json({ success: false, message: '无效或过期' });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: '请求失败', error: e.message });
  }
});

// 查询物品价格列表
app.get('/api/items', async (req, res) => {
  const { serverId, itemName, type } = req.query;
  const time = Date.now();

  const url = `https://api.52108.com/api/services/cbg/Goods/GetPaged?` +
              `GameServerId=${serverId}` +
              `&TypeList=` + // 必须为空
              `&PriceStart=&PriceEnd=` +
              `&EquipmentTypeList=&Id=&Name=${encodeURIComponent(itemName || '')}` +
              `&Sorting=&SkipCount=0&MaxResultCount=12` +
              `&time=${time}` +
              `&type=${type || ''}` + // ✅ 重点在这里
              `&RoleJobList=`;

  try {
    const response = await fetch(url, {
      headers: {
        'cookie': COOKIE,
        'authorization': TOKEN,
        'origin': 'https://dms.haodatang.com',
        'referer': 'https://dms.haodatang.com/'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: '请求失败', detail: err.message });
  }
});


// 获取服务器列表
app.get('/api/servers', async (req, res) => {
  const url = 'https://api.52108.com/api/services/cbg/GameServer/GetOther?OperatorId=2962&GameInfoId=23';

  try {
    const response = await fetch(url, {
      headers: {
        'cookie': COOKIE,
        'authorization': TOKEN,
        'origin': 'https://dms.haodatang.com',
        'referer': 'https://dms.haodatang.com/'
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: '获取服务器列表失败', detail: err.message });
  }
});

app.get('/api/detail', async (req, res) => {
  const { id } = req.query;
  const url = `https://api.52108.com/api/services/cbg/Goods/GetById?id=${id}`;
  try {
    const response = await fetch(url, {
      headers: {
        'cookie': COOKIE,
        'authorization': TOKEN,
        'origin': 'https://dms.haodatang.com',
        'referer': 'https://dms.haodatang.com/'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: '获取详情失败', detail: err.message });
  }
});



app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));