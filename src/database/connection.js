if(process.env.NODE_ENV == 'production') {
  module.exports = {mysqlURI: "mysql://manutencao:Navigu_03@awseb-e-3px43ti4i9-stack-awsebrdsdatabase-o542scrhyptb.cuuomrcedmbe.sa-east-1.rds.amazonaws.com:3306/ebdb"}
}else {
  module.exports = {mysqlURI: "mysql://cosmeticos:pransk@localhost:3306/cosmeticos"}
}