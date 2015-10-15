exports.get = function (db, params) {
  return {data: 'test'};
};
exports.getIndex = function (db, params) {
  return {data: 'test', user: params.user};
};
exports.post = function (db, params){
  
};
