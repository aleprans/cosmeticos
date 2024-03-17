if(process.env.NODE_ENV == 'production') {
  module.exports = {mysqlURI: "mysql://sql10692176:VmARu11efc@sql10.freesqldatabase.com:3306/sql10692176"}
}else {
  module.exports = {mysqlURI: "mysql://cosmeticos:pransk@localhost:3306/cosmeticos"}
}