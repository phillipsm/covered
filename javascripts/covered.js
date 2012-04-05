$.extend({

  apiEndpoint: function(){ return 'http://api.dp.la/dev/' },

  constructDoc: function(d,facets){
    var node = $('<div />').attr({class: 'doc ' + d.data_source, id: 'doc-' + d.id}), nodeContent = '';
    if(d.id_isbn != undefined){
      $.each(d.id_isbn,function(i,isbn){
      	// var related = $.relatedEditions(isbn);
      	nodeContent += '<img src="http://covers.openlibrary.org/b/isbn/' + isbn + '-S.jpg" class="cover" />';
      	});
    }
    console.log(d);
    if(d.content_link.length >= 1){nodeContent += '<a href="' + d.content_link[0] + '">';}
    nodeContent += d.title;
    if(d.content_link.length >= 1){nodeContent += '</a>';}
    nodeContent += '<span class="data_source">' + d.data_source + '</span>';
    facets[d.data_source] = (facets[d.data_source] == undefined) ? 1 : (facets[d.data_source] + 1);
    return node.append(nodeContent);
  },
	
	relatedEditions: function(isbn){
		var related = [];
		$.getJSON('http://xisbn.worldcat.org/webservices/xid/isbn/' + isbn + '?method=getEditionsa&format=json&fl=*&callback=?')
			.done(function(data){
				if(data.list.length >= 1){
					$.each(data.list,function(i,record){
						related.push(record.isbn[0]);
						});
					}
				});
		return related;
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
        $('#nope').remove();
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
          $('#facets').append($('<span/>').attr({class: 'filter', data_filter_class: "." + key}).html(key + ' - ' + val));
        });
        $('#facets').append($('<span/>').attr({class: 'filter', data_filter_class: '*'}).html('Show all'));
        if(json.docs.length == 0){
          $('#submit').after('<span id="nope">None found.</span>');
        }
      }
    });
  });
});
