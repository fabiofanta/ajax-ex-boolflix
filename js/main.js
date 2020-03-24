$(document).ready(function() {

    //handlebars template
    var source = $("#card-template").html();
    var cardTemplate = Handlebars.compile(source);
    //end handlebars

    var apiBaseUrl = 'https://api.themoviedb.org/3';
    var movie = 'movie';
    var searchTv = 'tv';
    var apiPoster = 'https://image.tmdb.org/t/p/';
    var posterWidth = 'w342';

    $('#input-button').click(search);
    $('#input-bar').keypress(function(event) {
        if(event.key =='Enter') {
            search();
        };
    });

    function search() {
        $('.card').remove(); // reset search
        var searchBData = $('#input-bar').val();
        if (searchBData.length !== 0) {
            apiSearch(searchBData,movie);
            apiSearch(searchBData,searchTv);

        } else {
            alert('Inserisci qualcosa');
        };

    };

    function apiSearch(queryText,queryType) {
        $.ajax({
            url: apiBaseUrl + '/search/' + queryType,
            data: {
                api_key: '0e9052ad7b0a0c76eb018c431e65c6ce',
                query: queryText,
                language: 'it-IT',
                // append_to_response: 'credit,genres',
            },
            method:'GET',
            success: function(data) {
                console.log(data);
                var videos = data.results;
                // console.log(videos);
                loop(videos,queryType);
                starsFill();
            },
            error: function(err) {
                alert('Error!');
            }

        });
    }

    function appendFn(context,appendSel) {
        var filledTemplate = cardTemplate(context);
        $(appendSel).append(filledTemplate);
    };

    function obNChanger(qryType,obj,arr) {
        if (qryType == 'tv') {
            obj.title = arr.name;
            obj.originTitle = arr.original_name;
        };
    };

    function loop(arrays,queryType) {
        for (var i = 0; i < arrays.length; i++) {
            var array = arrays[i];
            // console.log(array);
            var vote = roundVote(array.vote_average);
            var languageEng = language(array.original_language);
            var object = {title:array.title, originTitle: array.original_title,language:languageEng,vote:vote,poster:posterPath(array.poster_path),description:array.overview};
            obNChanger(queryType,object,array);
            appendFn(object,'.card-container');
        };

    };

    function language(string) {
        if (string == 'en') {
            return 'gb';
        } else {
            return string; // also --> da hi ja zh sk
        };
    };

    function roundVote(number) {
        var tToF = Math.ceil(number/2);
        return tToF;
    };

    function starsFill() {
        $('.stars').each(function() {
            var starN = $(this).data('vote');
            $(this).children('i:nth-child(-n+' + starN +')').removeClass('far').addClass('fas').addClass('stars-yellow');
        });
    };

    function posterPath (path) {
        if (path !== null) {
            return apiPoster + posterWidth + path;
        }
         else {
            return "img/glyphicon-film-poster.png"
        }
    }

});
