var pmongo = require('promised-mongo');
exports.post = function (user, db, params) {
  params.createdAt = new Date();
  params.owner = user;
  params.videos = {};
  return db.collection('playlists').save(params).then(function(result){
    params._id = result._id;
    db.collection('users').update({_id: pmongo.ObjectId(user)}, {$push :{'playlists': params}});
    return {result: result};
  });
  
};

exports.put = function (user, db, params) {
  var video_id = params.id;
  var videoInfo = {
    id: params.data["id"], 
    publishedAt: params.data["snippet"]["publishedAt"], 
    title: params.data["snippet"]["title"], 
    thumbnail: params.data["snippet"]["thumbnails"]["medium"],
    channelTitle: params.data["snippet"]["channelTitle"],
    creationDate: new Date()
  };
  return db.collection('playlists')
  .findAndModify({query: {user_id: user}, update: {$addToSet: {videos: videoInfo}}, upsert: true})
  .then(function (favourites) {
    return {
      playlist: playlist
    };
  });
};

exports.getIndex = function (user, db, params){
  return db.collection('playlists').find({owner: user}).sort({name: 1}).toArray().then(function(playlists){
    return {playlists: playlists};
  });
};
exports.get = function (user, db, params){
  return db.collection('playlists').find({_id: pmongo.ObjectId(params.id)}).sort({name: 1}).toArray().then(function(playerlists){
    return {playerLists: playerlists};
  });
};

