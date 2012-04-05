$.extend({

  apiEndpoint: function(){ return 'http://api.dp.la/dev/' },

  constructDoc: function(d,facets){
    var node = $('<div />').attr({class: 'doc ' + d.data_source, id: 'doc-' + d.id});
    if(d.id_isbn != undefined){
      $(d.id_isbn).each(function(i,isbn){
        $(node).append($('<img />').attr({src: 'http://covers.openlibrary.org/b/isbn/' + isbn + '-S.jpg', class: 'cover'}));
      });
    }
    $(node).append(d.title);
    $(node).append($('<span />').attr({class: 'data_source'}).html(d.data_source));
    facets[d.data_source] = 1;
    return node;
  },

  initIsotope: function(){
    var isotope_obj = $('#target').isotope({
      columnWidth: 300,
      itemSelector : '.doc',
      layoutMode : 'masonry'
    });
  },

  postInit: function(){
    $('.filter').click(function(e){
      $('#target').isotope({filter: $(this).attr('data_filter_class')});
    });
    // relayout as cover images may've effected container height.
    setTimeout(function(){$('#target').isotope('reLayout')}, 500);
  }

});

$(document).ready(function(){
  $('#keyword').focus();
  $('form#query').submit(function(e){
    e.preventDefault();
    $.ajax({
      url: $.apiEndpoint() + 'item',
      data: {search_type: 'keyword', query: $('#keyword').val(), facet: 'subject'},
      dataType: 'jsonp',
      beforeSend: function(){
        $('#submit').val('please wait . . .');
        $('#target').html('');
        $('#target').isotope('destroy');
        $('#facets').html('');
      },
      complete: function(){
        $('#submit').val('go!');
        $.postInit();
      },
      success: function(json){
        $.initIsotope();
        console.log(json);
        var facets = {};
        $(json.docs).each(function(i,el){
          $('#target').isotope('insert',$.constructDoc(el,facets));
        });
        $.each(facets, function(key,val){
          $('#facets').append($('<span/>').attr({class: 'filter', data_filter_class: "." + key}).html(key));
        });
        $('#facets').append($('<span/>').attr({class: 'filter', data_filter_class: '*'}).html('Show all'));
      }
    });
  });
});
