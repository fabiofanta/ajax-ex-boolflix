$(document).ready(function() {

    //handlebars card template
    var source = $("#card-template").html();
    var cardTemplate = Handlebars.compile(source);
    // handlebars filter template
    var src = $("#filter-template").html();
    var filterTemplate = Handlebars.compile(src);
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

    selector();

    function search() {
        $('.card').remove(); // reset search
        var searchBData = $('#input-bar').val();
        if (searchBData.length !== 0) {
            apiSearch(searchBData,searchMovie,'.movie');
            apiSearch(searchBData,searchTv,'.tv');
            $('.overlay').addClass('hide');
        } else {
            alert('Inserisci qualcosa');
        };

    };

    function checkIfExist(position) {
        var originalTitle = $(position).find('.card-description #main-title ').text();
        var title = $(position).find('.card-description #title').text();
        if (originalTitle == title) {
            $(position).find('.original-title-container').addClass('hide');
        };
        $(position).find('.card-description .api-value').each(function() {
            var text = $(this).text();
            if (text == "") {
                $(this).parent().addClass('hide');
            };
        })
    };

    function apiSearch(queryText,queryType) {
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
                var cardPosition = '.card-container'+ '.' + queryType
                var filterPosition = '.genre-selector'+ '.' + queryType;
                appendCard(videos,queryType,cardPosition);
                appendDetails(queryType,cardPosition);
                apiFilter(queryType,filterPosition);
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

    function stringJoin(array,arrLength,position,elementName) {
        var appendPosition = '<span class="highlight">'+ elementName +':</span>'
        $(position).find('.card-description .'+ elementName +'-container').append(appendPosition);
        if (array.length == 0) {
            var string = "";
            $(position).find('.card-description .'+ elementName +'-container').append(' <span class="' + elementName + ' api-value">'+ string +'</span> ');
        } else {
            for (var i = 0; i < arrLength; i++) {
                var string = array[i].name;
                $(position).find('.card-description .'+ elementName +'-container').append(' <span class="' + elementName + '">'+ string +'</span> ');
            };
        };
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
                var cast = data.credits.cast
                var genres = data.genres;
                var arrLen = arrLenCheck(cast);
                stringJoin(cast,arrLen,position,"cast");
                stringJoin(genres,genres.length,position,"genre");
                checkIfExist(position);
            },
            error: function(err) {
                alert('Error!');
            }

        });
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
            var filledTemplate = cardTemplate(object);
            if (filledTemplate == "") {
                $('.overlay').addClass('hide');
            };
            $(position).append(filledTemplate);
        };

    };

    function apiFilter(qryTyp,position) {
        $.ajax({
            url: apiBaseUrl + '/genre/' + qryTyp + '/' + 'list',
            data: {
                api_key: '0e9052ad7b0a0c76eb018c431e65c6ce',
            },
            method:'GET',
            success: function(data) {
                console.log(data);
                var genres = data.genres;
                appendFilters(genres,qryTyp,position);
            },
            error: function(err) {
                alert('Error!');
            }

        });
    };

    function appendFilters(arrays,queryType,position) {
        for (var i = 0; i < arrays.length; i++) {
            var array = arrays[i];
            var object = {genre:array.name,genreId:array.id};
            var filledTemplate = filterTemplate(object);
            $(position).append(filledTemplate);
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
        } else {
            return "img/glyphicon-film-poster.png"
        };
    };

    function selector() {
        $('.genre-selector').change(function() {
            var genreSel = $(this).val().toLowerCase();
            var contentLink = $(this).attr('class').split(' ')[1];
            var cardPosition = '.card-container' + '.' + contentLink + ' .card';
            var optionPosition = '.genre-selector' + '.' + contentLink + ' option'
            if (genreSel == "" || genreSel == "all") {
                $(cardPosition).removeClass('hide');
                $(cardPosition).addClass('show');
            } else {
                $(optionPosition).each(function() {
                    var genre = $(this).val().toLowerCase();
                    if (genre == genreSel) {
                        var genreId = $(this).data('genre');
                        $(cardPosition).each(function() {
                            var genreList = '['+ $(this).data('genre') + ']';
                            if (genreList.includes(genreId)) {
                                $(this).removeClass('hide');
                                $(this).addClass('show');
                            } else {
                                $(this).removeClass('show');
                                $(this).addClass('hide');
                            };

                            if ($('.card-container'+'.' +contentLink+'').children('.card').hasClass('show')){
                                $('.card-container'+'.' +contentLink+'').find('.overlay').addClass('hide');
                                $('.card-container'+'.' +contentLink+'').find('.overlay').removeClass('show');

                            } else {
                                $('.card-container'+'.' +contentLink+'').find('.overlay').removeClass('hide');
                                $('.card-container'+'.' +contentLink+'').find('.overlay').addClass('show');
                            }
                        });
                    };
                });
            };
        });
    };
});
