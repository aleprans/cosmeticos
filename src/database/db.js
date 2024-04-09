const connectionDb = require('./connection')

async function connect(){
  if(global.connection && global.connection.state !== 'disconnected') return global.connection
    const mysql = require('mysql2/promise')
    const connection = await mysql.createConnection(connectionDb.mysqlURI)
    global.connection = connection
    return connection
}

async function createTables() {
  const conn = await connect()
  const TableClientes = 'CREATE TABLE IF NOT EXISTS clientes ('+
    'id int NOT NULL AUTO_INCREMENT,'+
    'nome varchar(255) NOT NULL,'+
    'cpf varchar(11) NOT NULL,'+
    'endereco varchar(255),'+
    'telefone varchar(11),'+
    'email varchar(255),'+
    'PRIMARY KEY (id)'+
    ')'
  await conn.query(TableClientes)
  
  const tableUsuario = 'CREATE TABLE IF NOT EXISTS usuarios ('+
    'id int NOT NULL AUTO_INCREMENT,'+
    'usuario varchar(8) NOT NULL,'+
    'nome varchar(255) NOT NULL,'+
    'cpf varchar(11) NOT NULL,'+
    'email varchar(255) NOT NULL,'+
    'senha varchar(255) NOT NULL,'+
    'eadmin int DEFAULT 0,'+
    'PRIMARY KEY (id)'+
    ')'
  await conn.query(tableUsuario)
  
  const tableEstoque = 'CREATE TABLE IF NOT EXISTS estoque ('+
    'id int NOT NULL AUTO_INCREMENT,'+
    'codigo varchar(12) NOT NULL,'+
    'descricao varchar(255) NOT NULL,'+
    'fabricante varchar(255) NOT NULL,'+
    'custo FLOAT NOT NULL,'+
    'lucro varchar(6) NOT NULL,'+
    'venda FLOAT NOT NULL,'+
    'qtde int DEFAULT 0,'+
    'qtdeMin int DEFAULT 0,'+
    'PRIMARY KEY (id)'+
    ')'
  await conn.query(tableEstoque)

  const moviEstoque = 'CREATE TABLE IF NOT EXISTS moviEstoque ('+
    'id int NOT NULL AUTO_INCREMENT,'+
    'codigo varchar(12) NOT NULL,'+
    'qtde int DEFAULT 0,'+
    'dtAtual DATE ,'+
    'usuario INT ,'+
    'tipo INT ,'+
    'fornecedor varchar(255) ,'+
    'nota varchar(12) ,'+
    'motivo varchar(255) ,'+
    'PRIMARY KEY (id)'+
    ')'
  await conn.query(moviEstoque)

  const formPagamentos = 'CREATE TABLE IF NOT EXISTS formPagamentos ('+
    'id INT NOT NULL AUTO_INCREMENT,'+
    'codigo VARCHAR(12) NOT NULL,'+
    'descricao VARCHAR(255) NOT NULL,'+
    'PRIMARY KEY (id)'+
    ')'
  await conn.query(formPagamentos)

  const itensVendidos = 'CREATE TABLE IF NOT EXISTS itensVendidos ('+
    'id INT NOT NULL AUTO_INCREMENT,'+
    'idItem INT NOT NULL,'+
    'qtdeItem INT NOT NULL,'+
    'idVenda INT NOT NULL,'+
    'valor FLOAT NOT NULL,'+
    'PRIMARY KEY (id)'+
    ')'
  await conn.query(itensVendidos)

  const vendas = 'CREATE TABLE IF NOT EXISTS vendas ('+
    'id INT NOT NULL AUTO_INCREMENT,'+
    'valor FLOAT NOT NULL,'+
    'dataVd DATE NOT NULL,'+
    'usuario INT NOT NULL,'+
    'status INT NOT NULL,'+
    'vlorigin FLOAT NOT NULL,'+
    'PRIMARY KEY (id)'+
    ')'
  await conn.query(vendas)

  return 
}

const tabelas = [
  ['clientes','nome', 'cpf', 'endereco', 'telefone', 'email'], // 0
  ['usuarios', 'nome', 'usuario', 'cpf', 'email', 'eadmin', 'senha'], // 1
  ['estoque', 'codigo', 'descricao', 'fabricante', 'qtdeMin', 'qtde', 'custo', 'lucro', 'venda' ], // 2
  ['moviEstoque', 'codigo', 'qtde', 'dtAtual', 'usuario', 'tipo', 'fornecedor', 'nota', 'motivo'], // 3
  ['formPagamentos', 'codigo', 'descricao'], // 4
  ['itensVendidos', 'idItem', 'qtdeItem', 'idVenda', 'valor'], // 5
  ['vendas', 'valor', 'dataVd', 'usuario', 'status', 'vlorigin'] // 6
]

async function signIn(tab, usuario) {
  const conn = await connect()
  const sql = 'SELECT * FROM ' +tabelas[tab][0]+' WHERE usuario = ? '
  const params = [usuario]
  const [rows] = await conn.query(sql, params)
  return rows[0]
}

async function selectSpecific(tab, campo, dado) {
  const conn = await connect()
  const sql = 'SELECT * FROM '+tabelas[tab][0]+' WHERE '+tabelas[tab][campo]+' = ? ;'
  const params = [dado]
  const [rows] = await conn.query(sql, params)
  return rows
}

async function selectAll(tab, order = null){
  const conn = await connect()
  const sql = "Select * from " +tabelas[tab][0]
  if(order != null){
    sql = sql+" order by "+tabelas[tab][order]
  }
  const [rows] = await conn.query(sql)
  return rows
}

async function selectOneId(tab, id){
  const conn = await connect()
  const sql = "Select * from " +tabelas[tab][0]+ " where id = ?"
  const values = [id]
  const [rows] = await conn.query(sql, values)
  return rows
}

async function insert(tab, dados){
  let dado = Object.values(dados).join("','")
  const conn = await connect()
  const campos = tabelas[tab].slice(1).join()
  const sql = "INSERT INTO " +tabelas[tab][0]+ " ("+campos+ ") VALUES ('"+dado+"')"
  return await conn.query(sql)
}

async function update(tab, id, dados){
  const arrDados = Object.values(dados)
  const conn = await connect()
  const campos = tabelas[tab].slice(1)
  let param = []
  for(let i = 0; i < campos.length ; i++){
    param[i] = campos[i] + ' = "'+arrDados[i]+'"'
  }
  const params = param.join(",")
  const sql = "UPDATE " +tabelas[tab][0]+" SET "+params+" WHERE ID = ?"
  const values = [id]
  return await conn.query(sql, values)
}

async function updateSpecific(tab, id, campo, dado){
  const arrDados = Object.values(dado)
  const conn = await connect()
  const campos = tabelas[tab][campo]
  let param = campos+' = '+dado
  const sql = "UPDATE " +tabelas[tab][0]+" SET "+param+" WHERE ID = ?"
  const values = [id]
  return await conn.query(sql, values)
}

async function deleteId(tab, id){
  const conn = await connect()
  const sql = "DELETE FROM " +tabelas[tab][0]+ " WHERE id = ?"
  const values = [id]
  return await conn.query(sql, values)
}

async function deleteSpecific(tab, campo, id){
  const conn = await connect()
  const sql = "DELETE FROM " +tabelas[tab][0]+ " WHERE "+campo+" = ?"
  const values = [id]
  return await conn.query(sql, values)
}

async function query(comand) {
  const conn = await connect()
  const [rows] = await conn.query(comand)
  return rows
}


module.exports = {createTables, signIn, selectAll, selectOneId, selectSpecific, insert, update, updateSpecific, deleteId, deleteSpecific, query}