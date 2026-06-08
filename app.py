from flask import Flask, render_template
from database import db

from models.usuario import Usuario
from models.fornecedor import Fornecedor
from models.farmaco import Farmaco
#from models.lote import Lote
#from models.movimentacao import Movimentacao

from flask import request, jsonify

# Importa a biblioteca para criptografar senhas.
from werkzeug.security import generate_password_hash, check_password_hash


from flask_cors import CORS

# importa abiblioteca para autenticação de Token da Web (JWT).
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt

# Importa a bibliotea para manipular datas.
from datetime import timedelta

# Importa os módulos para manipular variáveis de ambiente.
from dotenv import load_dotenv
import os

app = Flask (__name__)

# Habilita o back-end a responder solicitações do front-end.
CORS(app)

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Configura o banco de dados MySQL.
app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Configura o Token da web (JWT).
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=8)

# Inicializa o gerenciador de Tokens da web (jWT).
jwt = JWTManager(app)

# Vincula o banco de dados à aplicação da web.
db.init_app(app)

# Cria as tabelas de banco de dados, se ainda não existirem.
with app.app_context():
    db.create_all()

    # Insere o adminstrador caso nao exista.
    if not Usuario.query.filter_by(email="admin@unesp.com").first():
        master = Usuario(
            nome="Administrador",
            email="admin@unesp.com",
            senha=generate_password_hash("admin"),
            administrador=True
        )
        db.session.add(master)
        db.session.commit()


# @app.route('/')
# def home():
#     return render_template('html/index.html')

# _________
# Rota para login usuário.
@app.route('/api/login', methods=['POST'])
def tela_login():

     # Recebe os dados do front-end.
    dados = request.get_json()
    email = dados.get("email")
    senha = dados.get("senha")

     # Bsuca o usuario no banco de dados pelo cpf.
    usuarios = Usuario.query.filter_by(email=email).first()

     #Verifica se o usuário existe e se a senha está correta.
    if not usuarios or not check_password_hash(usuarios.senha, senha):

        #Login incorreto.
        return jsonify({"error": "Email ou senha inválidos."}), 401
    
    else:

        # Login correto.
        token = create_access_token(
            identity=str(usuarios.id_usuario),
            additional_claims={
                "administrador": usuarios.administrador
    }
)

        return jsonify({"token": token}),200

# Rota para logout de usuario.
@app.route("/api/logout", methods=["POST"])
@jwt_required()
def logout():

    return jsonify({"message": "Logout realizado com sucesso."}), 200

@app.route('/home')
def dashboard():
    return "<h1>Login realizado com sucesso</h1>"
# ________________________

#_______
# POST
@app.route("/api/fornecedores", methods=["POST"])
@jwt_required()
def criar_fornecedor():
    # Verifica se o usuário é um administrador.
    claims = get_jwt()
    if not claims["administrador"]:
        return jsonify({"erro": "Acesso negado!"}), 403

    dados = request.get_json()
    nome=dados.get("nome")
    cnpj=dados.get("cnpj")
    telefone=dados.get("telefone")
    email=dados.get("email")

    try:
        # Verifica se o fornecedor já existe no banco de dados.
        if Fornecedor.query.filter_by(cnpj=cnpj).first():
            return jsonify({"error": "Fornecedor já existe."}), 409
        
        else:
            novo_fornecedor = Fornecedor(
                nome=nome,
                cnpj=cnpj,
                telefone=telefone,
                email=email
            )
            db.session.add(novo_fornecedor)
            db.session.commit()
            return jsonify({"message": "Fornecedor criado com sucesso."}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Ocorreu um erro ao criar o fornecedor."}), 500
    
#________________________
# GET
@app.route("/api/fornecedores", methods=["GET"])
@jwt_required()
def listar_fornecedores():

    claims = get_jwt()

    if not claims["administrador"]:
        return jsonify({"erro": "Acesso negado!"}), 403

    try:

        fornecedores = Fornecedor.query.all()

        resultado = [{
            "id": fornecedor.id,
            "nome": fornecedor.nome,
            "cnpj": fornecedor.cnpj,
            "telefone": fornecedor.telefone,
            "email": fornecedor.email
        } for fornecedor in fornecedores]

        return jsonify(resultado), 200

    except Exception as e:
        # print(e)
        return jsonify({"error": "Ocorreu um erro ao buscar os fornecedores."}), 500
# @app.route("/api/fornecedores", methods=["GET"])
# @jwt_required()
# def listar_fornecedores():
#      # Verifica se o usuário é um administrador.
#     claims = get_jwt()
#     if not claims["administrador"]:
#         return jsonify({"erro": "Acesso negado!"}), 403
    
#     #tenta buscar os fornecedores no banco de dados.
#     try:
#         # Busca todos os fornecedores ativos no banco de dados.
#         fornecedores = Fornecedor.query.filter_by(status=True).all()

#         resultado = [{
#             "id": fornecedor.id_fornecedor,
#             "nome": fornecedor.nome,
#             "cnpj": fornecedor.cnpj,
#             "telefone": fornecedor.telefone,
#             "email": fornecedor.email
#         } for fornecedor in fornecedores]
#         return jsonify(resultado), 200
#     except Exception as e:
#         return jsonify({"error": "Ocorreu um erro ao buscar os fornecedores."}), 500
    
if __name__ == '__main__':
    app.run(debug=True)
