$(document).ready(function() {

    //handlebars template
    var source = $("#card-template").html();
    var cardTemplate = Handlebars.compile(source);
    //end handlebars

    var apiBaseUrl = 'https://api.themoviedb.org/3';
    var searchMovie = 'movie';
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
            apiSearch(searchBData,searchMovie,'.movies');
            apiSearch(searchBData,searchTv,'.tv-shows');
        } else {
            alert('Inserisci qualcosa');
        };

    };

    function apiSearch(queryText,queryType,position) {
        $.ajax({
            url: apiBaseUrl + '/search/' + queryType,
            data: {
                api_key: '0e9052ad7b0a0c76eb018c431e65c6ce',
                query: queryText,
                language: 'it-IT',
                append_to_response: 'credit',
            },
            method:'GET',
            success: function(data) {
                console.log(data);
                var videos = data.results;
                appendCard(videos,queryType,position);
                appendDetails(queryType,position);
                starsFill();
            },
            error: function(err) {
                alert('Error!');
            }

        });
    };

    function arrLenCheck(array) {
        if (array.length <= 5) {
            var arrLength = array.length;
        } else {
            var arrLength = 5;
        };
        return arrLength
    };

    function stringJoin(array,arrLength) {
        var fakeArray = [];
        for (var i = 0; i < arrLength; i++) {
             var string = array[i].name;
             fakeArray.push(string);
    };
    return fakeArray.join()
};

    function appendDetails(queryType,position) {
        $(position  + ' .card').each(function() {
            var id = $(this).data('id');
            apiTvMovie(queryType,id,this);

        });
    };

    function apiTvMovie(qryTyp,id,position) {
        $.ajax({
            url: apiBaseUrl + '/' + qryTyp + '/' + id + '?',
            data: {
                api_key: '0e9052ad7b0a0c76eb018c431e65c6ce',
                append_to_response: 'credits',
            },
            method:'GET',
            success: function(data) {
                var cast = data.credits.cast;
                var genres = data.genres;
                var arrLen = arrLenCheck(cast);
                var castString = stringJoin(cast,arrLen);
                var genresString = stringJoin(genres,genres.length);
                $(position).find('.card-description').append(castString);
                $(position).find('.card-description').append(genresString);
            },
            error: function(err) {
                alert('Error!');
            }

        });
    };

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

    function appendCard(arrays,queryType,position) {
        for (var i = 0; i < arrays.length; i++) {
            var array = arrays[i];
            // console.log(array);
            var vote = roundVote(array.vote_average);
            var languageEng = language(array.original_language);
            var object = {title:array.title, originTitle: array.original_title,language:languageEng,vote:vote,poster:posterPath(array.poster_path),description:array.overview,id:array.id,genreId:array.genre_ids};
            obNChanger(queryType,object,array);
            appendFn(object,position);
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
