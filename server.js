import express from 'express';
import path from 'path';
import { MongoClient, ObjectId } from 'mongodb';
import session from 'express-session';
import bcrypt from 'bcrypt';
import methodOverride from 'method-override';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session({
    secret: 'seu-segredo-aqui',
    resave: false,
    saveUninitialized: true,
}));
app.use(express.static(__dirname + '/public'));

const url = 'mongodb://127.0.0.1:27017/';
const dbName = 'contasRegistradas';
const collectionName = 'usuarios';

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/pages/index.html');
});

app.get('/aboutUs', (req, res) => {
    res.sendFile(__dirname + '/pages/aboutUs.html');
});

app.get('/ourTeam', (req, res) => {
    res.sendFile(__dirname + '/pages/ourTeam.html');
});

app.get('/howWeWork', (req, res) => {
    res.sendFile(__dirname + '/pages/howWeWork.html');
});

app.get('/faq', (req, res) => {
    res.sendFile(__dirname + '/pages/faq.html');
});

app.get('/sustainability', (req, res) => {
    res.sendFile(__dirname + '/pages/sustainability.html');
});

app.get('/product-development', (req, res) => {
    res.sendFile(__dirname + '/pages/productDevelopment.html');
});

app.get('/comunity-workshops', (req, res) => {
    res.sendFile(__dirname + '/pages/comunityWorkshops.html');
});

app.get('/services', (req, res) => {
    res.sendFile(__dirname + '/pages/services.html');
})

app.get('/soy', (req, res) => {
    res.sendFile(__dirname + '/pages/soy.html');
})

app.get('/wheat', (req, res) => {
    res.sendFile(__dirname + '/pages/wheat.html');
})

app.get('/linseed', (req, res) => {
    res.sendFile(__dirname + '/pages/linseed.html');
})

app.get('/quinoa', (req, res) => {
    res.sendFile(__dirname + '/pages/quinoa.html');
})

app.get('/chia', (req, res) => {
    res.sendFile(__dirname + '/pages/chia.html');
})

app.get('/oat', (req, res) => {
    res.sendFile(__dirname + '/pages/oat.html');
})

app.get('/update-user-info', (req, res) => {
    res.sendFile(__dirname + '/pages/updateUserInfo.html');
})

app.post('/update-user-info', async (req, res) => {
    const { username, email, country, birthDate } = req.body;
    const user = req.session.user;

    const client = new MongoClient(url);

    try {
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const result = await collection.updateOne(
            { email: user },
            { 
                $set: { 
                    username,
                    email,
                    country,
                    birthDate
                }
            }
        );

        if (result.modifiedCount > 0) {
            res.redirect('/?success=Dados atualizados com sucesso!');
        } else {
            res.status(404).send('Erro ao atualizar dados')
        }
        
    } catch (err) {
        console.error('Erro ao atualizar dados', err);
        res.status(500).send('Erro ao atualizar dados. Por favor, tente novamente mais tarde.');
    } finally {
        client.close();
    }
});

app.post('/create-account', async (req, res) => {
    const newUser = req.body;
    const cliente = new MongoClient(url);

    try {
        await cliente.connect();
        const db = cliente.db(dbName);
        const collection = db.collection(collectionName);
        const usuarioExistente = await collection.findOne({ email: newUser.email });

        if (usuarioExistente) {
            res.send('Email já cadastrado. Por favor, tente outro.');
        } else {
            const senhaCriptografada = await bcrypt.hash(newUser.password, 10);
            await collection.insertOne({
                username: newUser.username,
                email: newUser.email,
                password: senhaCriptografada,
                birthDate: newUser.birthDate,
                country: newUser.country
            });
            res.redirect('/?success=Conta criada com sucesso!');
        }
    } catch (erro) {
        console.error('Erro ao criar conta:', erro); 
        res.send('Erro ao criar conta.');
    } finally {
        cliente.close();
    }
});

app.post('/login', async (req, res) => {
    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const user = await collection.findOne({ email: req.body.email }); 

        if (user && await bcrypt.compare(req.body.password, user.password)) {
            req.session.user = req.body.email;
            res.redirect('/user-account');
        } else {
            res.redirect('/?success=Email e/ou senha do usuário inválidos!');
        }
    } catch (erro) {
        console.error('Erro ao fazer login', erro);
        res.status(500).send('Erro ao fazer login. Por favor, tente novamente mais tarde.');
    } finally {
        client.close();
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/?success=Erro ao sair.');
        }
        res.redirect('/');
    });
});

function protectRoute(req, res, next) {
    if (req.session.user) {
        next()
    } else {
        res.redirect('/?loginModal=true')
    }
}

function protectRouteResponsive(req, res, next) {
    if (req.session.user) {
        next()
    } else {
        res.redirect('/login-mobile')
    }
}

app.get('/user-account', protectRoute, (req, res) => {
    res.sendFile(__dirname + '/pages/userAccount.html'); 
});

app.get('/login-mobile', (req, res) => {
    res.sendFile(__dirname + '/pages/loginResponsive.html'); 
});

app.get('/user-account-responsive', protectRouteResponsive, (req, res) => {
    res.sendFile(__dirname + '/pages/userAccount.html'); 
});

app.get('/update-password',  (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/updatePassword.html'));
});

app.post('/update-password', async (req, res) => {
    const { newPassword, confirmPassword } = req.body;
    const user = req.session.user;

    if (newPassword !== confirmPassword) {
        return res.redirect('/?error=As senhas precisam ser iguais');
    }

    const client = new MongoClient(url);

    try {
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const senhaCriptografada = await bcrypt.hash(newPassword, 10)

        const result = await collection.updateOne(
            { email: user },
            { $set: { password: senhaCriptografada }}
        );

        if (result.modifiedCount > 0) {
            res.redirect('/?success=Senha atualizada com sucesso!');
        } else {
            res.status(400).send('Erro ao atualizar senha')
        }
        
    } catch (err) {
        console.error('Erro ao atualizar senha', err);
        res.status(500).send('Erro ao atualizar senha. Por favor, tente novamente mais tarde.')
    } finally {
        client.close();
    }
});

app.post('/delete-account', async (req, res) => {
    const user = req.session.user;

    const client = new MongoClient(url);
    
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.deleteOne({ email: user });
        
        if (result.deletedCount > 0) {
            req.session.destroy(err => {
                if (err) {
                    return res.redirect('/?success=Erro ao sair.');
                }
                res.redirect('/?success=Conta deletada com sucesso!');
            });
        } else {
            res.status(404).send('Usuário não encontrado.');
        }
    } catch (err) {
        console.error('Erro ao deletar conta do usuário', err);
        res.status(500).send('Erro ao deletar conta. Por favor, tente novamente mais tarde.');
    } finally {
        client.close();
    }
});

app.get('/user-info', async (req, res) => {
    const user = req.session.user;

    if (!user) {
        return res.status(401).json({ error: 'Usuário não está logado.' });
    }

    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const usuario = await collection.findOne({ email: user });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.json(usuario);
    } catch (erro) {
        console.error('Erro ao buscar dados do usuário', erro);
        res.status(500).json({ error: 'Erro ao buscar dados do usuário. Por favor, tente novamente mais tarde' });
    } finally {
        client.close();
    }
});

app.get('/user-info/:id', async (req, res) => {
    const { id } = req.params;

    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const usuario = await collection.findOne({ _id: new ObjectId(id) });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.json(usuario);
    } catch (erro) {
        console.error('Erro ao buscar dados do usuário', erro);
        res.status(500).json({ error: 'Erro ao buscar dados do usuário. Por favor, tente novamente mais tarde' });
    } finally {
        client.close();
    }
});


app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});