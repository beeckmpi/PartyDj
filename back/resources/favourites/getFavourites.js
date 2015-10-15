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
  var latest_update = new Date();
  return db.collection('favourites')
  .findAndModify({query: {user_id: user, 'videos.id': {$ne: videoInfo.id}}, update: {$addToSet: {videos: videoInfo},$set: {last_updated: latest_update}, $inc:{video_count: 1}}, upsert: true})
  .then(function (favourites) {
    return {
      favourites: favourites
    };
  });
};

exports.delete = function (user, db, params){
  var video_id = params.id;
  return db.collection('favourites')
  .update({user_id: user}, {$pull: {videos: {id: video_id}}, $inc:{video_count: -1}})
  .then(function (favourites) {
    return {
      favourites: favourites
    };
  });
};

exports.get = function (user, db, params){
  var video_id= params.id;
  return db.collection('favourites')
    .findOne({user_id: user, "videos.id": video_id})
    .then(function(favourites){
      return {
        favourites: favourites
      };
    });
};
exports.getIndex = function (user, db, params){
  return db.collection('favourites').find({user_id: user}).toArray()
    .then(function(favourites){
      return {
        favourites: favourites
      };
    });
};
