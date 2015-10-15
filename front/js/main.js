
$(function() {
  $(document).on('click', '.sidebar.icon', function(event){
    $('.left.sidebar').sidebar('setting', 'transition', 'overlay').sidebar('toggle');  
  });  
  $(document).on('click','#search-button', function(event){
    event.preventDefault();
    $('#search-container').html('');
    var q = $('#query').val();
    var href = "https://www.googleapis.com/youtube/v3/search?part=snippet&q="+q+"&maxResults=40&type=video&key=AIzaSyBkNjgK3WVUZxWZgnQKkB9Ahsqo0qWgq9U";
    $("#page").html(0);
    $('#load_more ').css('display','inherit');
    loadInVideos(href, q, 0);
  });  
  $('.ui.search').search({
    /*apiSettings: {
      action: 'search',
      url: 'http://suggestqueries.google.com/complete/search?client=youtube&q={query}&hl=en&ds=yt',
      dataType: 'JSONP',
      onComplete: function(response, element){
        var suggestions = response;
        response = [];
        $.each(suggestions[1], function(key, val) {
          response.push({"title":val[0]});
        });
        response.length = 5; // prune suggestions list to only 5 items
      }
    },*/
    source: function(request, response) {
            $.getJSON("http://suggestqueries.google.com/complete/search?callback=?",
                {
                  "hl":"en", // Language
                  "ds":"yt", // Restrict lookup to youtube
                  "jsonp":"suggestCallBack", // jsonp callback function name
                  "q":request.term, // query term
                  "client":"youtube" // force youtube style response, i.e. jsonp
                }
            );
            suggestCallBack = function (data) {
                var suggestions = [];
                $.each(data[1], function(key, val) {
                    suggestions.push({"value":val[0]});
                });
                suggestions.length = 5; // prune suggestions list to only 5 items
                response(suggestions);
            };
        },
    searchFullText: false,
    searchFields: ['title']
  });
});

function loadInVideos(href, searchterm, page)
{
  $.getJSON(href, function(json) {
    $.each(json.items, function(key){     
      if (this.id['videoId'] != undefined){
        var video_id = 'nv_'+this.id['videoId'];
      } else if (this.id['channelId'] != undefined){
        var video_id = 'nv_'+this.id['channelId'];
      } else if (this.id['playlistId'] != undefined){
        var video_id = 'nv_'+this.id['playlistId'];
      }
      
      var new_video = $('.originVideo').clone().attr('id', video_id).css('display', 'inline-block').removeClass('originVideo').appendTo('#search-container');
      $('#'+ video_id).data('videoInfo', this);
      $('#' + video_id + ' .title').html('<a><strong>'+this.snippet['title']+'</strong></a>');
      $('#' + video_id + ' .title a').attr('href', '/PDJ/videos/view/'+this.id['videoId']);
      $('#' + video_id + ' .author').html(this.snippet['channelTitle']);
      $('#' + video_id + ' .authorId').html(this.snippet['channelId']);
      //$('#' + video_id + ' .duration').html(this.contentDetails['duration']);
      $('#' + video_id + ' .description').html(this.snippet['description']);
      $('#' + video_id + ' .thumb-href').attr('href', '/PDJ/videos/view/'+this.id['videoId']).html('<img src="' + this.snippet['thumbnails']['medium']['url'] + '" class="video-thumb">');                    
    });
    var q = $('#query').val();
    var href = "https://www.googleapis.com/youtube/v3/search?part=snippet&q="+q+"&maxResults=20&type=video&key=AIzaSyBkNjgK3WVUZxWZgnQKkB9Ahsqo0qWgq9U";
    $('#load_more').attr('href', href+'&pageToken='+json.nextPageToken);
    var title = 'PartyDJ - search for [['+searchterm+']]';
    var data = new Array();
    data['type'] = 'search-list';
    data['data'] = $('#search-container').html();
  });
}