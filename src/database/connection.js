if(process.env.NODE_ENV == 'production') {
  module.exports = {mysqlURI: "mysql://sql10697263:wMAGUcvarI@sql10.freesqldatabase.com:3306/sql10697263"}
}else {
  module.exports = {mysqlURI: "mysql://cosmeticos:pransk@localhost:3306/cosmeticos"}
}