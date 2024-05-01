function msgAlert(text, tipo) {
  $('#msgtext').append(text+'<br>')
    $('#msg').css('visibility','visible' )
    if(tipo == 'erro'){
      $('#msg').css('border-color','#f00' )
      $('#msg').css('background','#f16060' )
    }else if(tipo == 'sucesso'){
      $('#msg').css('border-color','#0f0' )
      $('#msg').css('background','#79f07f' )
    }else if(tipo == 'alert'){
      $('#msg').css('border-color','#fa0' )
      $('#msg').css('background','#f1aa60' )
    }
    setTimeout(function()
      {$('#msgtext').text('')
      $('#msg').css('visibility', 'hidden')}
    ,3000)
}

$(document).ready(() => {
  $('#form').submit((e)=> {
    e.preventDefault()
  })
  var valorT = 0.00
  var valorTotal = 0.00
  var itemCaixa = []
  var resp = $('.invisible').text().split(',')
  var formPag = []
  var desconto = 0

  if(resp.length > 1) {
    msgAlert(resp[1], resp[0])}

  $('.date').datepicker({
    regional: 'pt-BR'
  })

  $('#usuario').keyup(function() {
    $(this).val($(this).val().toUpperCase())
  })

  $('#cadUsuario').keyup(function(ev){
    const keycode = (ev.keyCode ? ev.keyCode : ev.wich)
    if(keycode == 13){
      $('#nomeUsuario').focus()
    }
    $(this).val($(this).val().toUpperCase())
    if($(this).val().length == 0){
      $('#btnTrocarSenha').removeAttr('disabled')
    }else {
      $('#btnTrocarSenha').attr('disabled', 'true')
      $('#btnTrocarSenha').text('Trocar própria senha')

    }
  })

  $("#cadUsuario").focus(function() {
    $('#nomeUsuario').val('')
    $('#emailUsuario').val('')
    $('#cpfUsuario').val('')
    $('#nivelAcesso').val('')
  })

  $('#cadUsuario').blur(function() {
    if($(this).val() == '' || $(this).val().length < 5){
      msgAlert('Nome de usuário invalido!', 'erro')
    }else{
      const usuario = $(this).val()
      $.ajax({
        url: '/usuarios/pesqUsuario',
        type: 'post',
        dataType: 'json',
        data: {usuario: usuario},
        success: function(json) {
          if(json.status){
            $('#nomeUsuario').val(json.dados.nome).focus()
            $('#cpfUsuario').val(json.dados.cpf).mask('999.999.999-99')
            $('#emailUsuario').val(json.dados.email)
            $('#nivelAcesso').val(json.dados.eadmin == 1 ? "Administrador" : "Normal")
            $('#idUsuarioSelected').val(json.dados.id)
            $('#isInsert').val(false)
            $('#btnTrocarSenha').removeAttr('disabled')
            $('#btnTrocarSenha').text('Resetar senha')
          }else {
            $('#isInsert').val(true)
            $('#nomeUsuario').focus()
          }
        }
      })
    }
  })

  $('#usuario').keyup(function(e){
    const keycode = (e.keyCode ? e.keyCode : e.wich)
    if(keycode == 13){
      $('#senhaLogin').focus()
    }
  })

  $('#btnSalvar_estoque').click(function(e) {
    if(validarEstoque()) {
      $('#form').off('submit').submit()
    }
  })

  $('#btnSalvarUsuario').click(function() {
    if(validarUsuario()) {
      $('#isToggle').val(false)
      $('#form').off('submit').submit()
    }
  })

  $('#btnCancelAlterarSenhaAdmin').click(function(){
    $('.modal').removeClass('active')
  })

  $('#btnCancelAlterarSenha').click(function(){
    history.back()
  })

  $('#btnSalvarCliente').click(function() {
    if(validarCliente())
      $('#form').off('submit').submit()
  })
  
  $('#btnSalvarFornecedor').click(function() {
    if(validarFornecedor())
      $('#form').off('submit').submit()
  })

  $('#cpfUsuario').keyup(function(){
    $(this).mask('999.999.999-99')
  })

  $('#cpfCliente').keyup(function(){
    $(this).mask('999.999.999-99')
  })

  $('#cpfCliente').change(function(){
    $(this).mask('999.999.999-99')
  })

  $('#telCliente').mask('(99) 99999-9999', {selectOnFocus: true} )
  
  $('#telFornecedor').mask('(99) 99999-9999', {selectOnFocus: true} )

  $('#formDesconto').mask('9990.0', {reverse: true})

  $('#vlSaida').mask('999.999.999.990,00', {reverse: true})
  
  $('#valorCF').mask('999.999.999.990,00', {reverse: true})

  $('#telFornecedor').blur(function(){
    $.ajax({
      url: '/fornecedores/pesqForn',
      type: 'post',
      dataType: 'json',
      data: {tel: $(this).val()},
      success: function(json) {
        if(json.status){
          $('#idForn').val(json.dados[0].id)
          $('#nomeFornecedor').val(json.dados[0].fornecedor)
          $('#contatoFornecedor').val(json.dados[0].contato)
          $('#isInsert').val(false)
        }else {
          $('#nomeFornecedor').focus()
          $('#isInsert').val(true)
        }
      }
    })
  })
  
  $('#telFornecedor').focus(function() {
    $(this).val('')
    $('#nomeFornecedor').val('')
    $('#contatoFornecedor').val('')
    $('#idForn').val('')
  })
  
  $('#cpfCliente').blur(function() {
    if($(this).val().length > 0){
      if(validarCPF($(this).val())){
        msgAlert('CPF inválido!', 'erro')
        $(this).focus()
      }
    }
  })

  $('#telCliente').blur(function() {
    $.ajax({
      url: '/clientes/pesTel',
      type: 'post',
      dataType: 'json',
      data: {tel: $(this).val()},
      success: function(json){
        if(json.status){
          $('#nomeCliente').val(json.dados.nome)
          $('#emailCliente').val(json.dados.email)
          $('#enderecoCliente').val(json.dados.endereco)
          $('#cpfCliente').val(json.dados.cpf)
          $('#isInsert').val(false)
          $('#idCliente').val(json.dados.id)
          $('#cpfCliente').focus()
        }else {
          $('#isInsert').val(true)
          $('#cpfCliente').focus()
        }
      }
    })
  })

  $('#btnAtualizar_estoque').click(function() {
    let status = 0
    if($('#btn-select-forn span').text() == 'Selecione um fornecedor'){
      status += 1
      msgAlert('Fornecedor Obrigatório!', 'erro')
    }
    if($('#nota_estoque').val().length < 3){
      msgAlert('Nota Fiscal Obrigatória!', 'erro')
      status += 1
    }
      if($('#qtdeInsert_estoque').val() < 1 || $('#qtdeInsert_estoque').val() == null){
      msgAlert('Quantidade inválida!', 'erro')
      status += 1
    }
    if(status == 0) 
      $('#form').off('submit').submit()
  })

  $('#btnAtualizar_estoqueSaida').click(function() {
    if($('#motivo_saida').val().length < 3)
      msgAlert('Motivo Obrigatório!', 'erro')
    else if($('#qtdeSaida_estoque').val() < 1 || $('#qtdeSaida_estoque').val() == null)
      msgAlert('Quantidade inválida!', 'erro')
    else
      $('#form').off('submit').submit()
  })

  $('#btnRelatorioFornecedor').click(function() {
    if($('.btn-select-forn span').text() == 'Selecione um fornecedor')
      msgAlert('fornecedor Obrigatório!', 'erro')
    else if($('#dateIni').val() == '' || $('#dateFim').val() == "")
      msgAlert('Periodo inválido!', 'erro')
    else
      $('#form').off('submit').submit()
  })

  $('#btnRelatorioConta').click(function() {
  if($('#dateIni').val() == '' || $('#dateFim').val() == '')
      msgAlert('Periodo inválido!', 'erro')
    else
      $('#form').off('submit').submit()
  })

  $('#codigo_estoque').keyup(function(e) {
    $(this).val($(this).val().toUpperCase())
   })
 
  $('#codigoEntSai_estoque').keyup(function() {
    $(this).val($(this).val().toUpperCase())
  })

  $('#custo_estoque').keyup(function() {
    $('#custo_estoque').mask('999.999.999.990,00', {reverse: true})
    let custo = parseFloat($('#custo_estoque').val().replace('.', '').replace(',','.'))
    let lucro = parseFloat($('#lucro_estoque').val())
    if(lucro > 0 && custo > 0) calcularVenda(custo, lucro)
  })

  $('#lucro_estoque').keyup(function() {
    $(this).mask('9990.0', {reverse: true})
    let custo = parseFloat($('#custo_estoque').val().replace('.', '').replace(',','.'))
    let lucro = parseFloat($('#lucro_estoque').val())
    if(custo > 0 && lucro > 0) calcularVenda(custo, lucro)
  })

  $('#codigoEntSai_estoque').focus(function(){
    $('#descricao_estoque').val("")
    $('#fabricante_estoque').val("")
    $('#qtde_estoque').val("")
    $('#custo_estoque').val("")
    $('#lucro_estoque').val("")
    $('#venda_estoque').val("")
    $('#isSave_estoque').val('true')
    $('#id_estoque').val('')

  })

  $('#codigo_estoque').focus(function(){
    $('#descricao_estoque').val("")
    $('#fabricante_estoque').val("")
    $('#qtde_estoque').val("")
    $('#custo_estoque').val("")
    $('#lucro_estoque').val("")
    $('#venda_estoque').val("")
    $('#isSave_estoque').val('true')
    $('#id_estoque').val('')
    $(this).select()
  })

  $('#codigo_estoque').blur(function(){
    const dado = $(this).val()
    if(dado) {
      $.ajax({
        url: '/estoque/pesq',
        type: 'POST',
        dataType: 'json',
        data:{ codigo: dado},
        success:function(json){
          if(json.length > 0){
            $('#descricao_estoque').val(json[0].descricao)
            $('#fabricante_estoque').val(json[0].fabricante)
            $('#qtde_estoque').val(json[0].qtde)
            $('#qtde_estoque').attr('readonly','true')
            $('#custo_estoque').val(json[0].custo)
            $('#custoOrig_estoque').val(json[0].custoOrig)
            $('#lucro_estoque').val(json[0].lucro)
            $('#venda_estoque').val(json[0].venda)
            $('#id_estoque').val(json[0].id)
            $('#qtdeMin_estoque').val(json[0].qtdeMin)
            $('#isSave_estoque').val('false')
          }
        },
        error:function(e) {
          msgAlert('Erro ao recuperar dados', 'erro')
        } 
      })
    }
  })

  $('#formCodigo').blur(function() {
    $.ajax({
      url: '/caixa/pesqForm',
      type: 'post',
      dataType: 'json',
      data: {codigo: $(this).val()},
      success: function(json) {
        if(json.length > 0){
          $('#id').val(json[0].id)
          $('#formDescricao').val(json[0].descricao)
          $('#formDesconto').val(json[0].desconto)
          $('#isInsert').val(false)
        }else {
          $('#isInsert').val(true)
        }
      }
    })
  })

  $('#formCodigo').focus(function() {
    $(this).val('')
    $('#formDescricao').val('')
    $('#formDesconto').val('')
  })

  $('.btn-select').click(function() {
    $('.select-content').toggleClass('active')
      if($('.select-content').hasClass('active')){
        $('#input-select').val('')
        $('#input-select').focus()
      }
      const list = $('#itens-select').val().split(',')
      $('.options').find('li').remove()
      list.forEach(element => {
        $('.options').append(`<li class="li">${element}</li>`)
      })
      $('.li').each(function() {
        $(this).click(function() {
          $('.btn-select span').text($(this).text())
          $('.select-content').removeClass('active')
          const cod = $('.btn-select span').text().split('-')
          $.ajax({
            url: '/caixa/qtdeEstoque',
            type: 'POST',
            dataType: 'json',
            data:{ codigo: cod[0]},
            success:function(json){
              $('#item-qtde-estoque').val(json[0].qtde)
              $('#item-qtde').val(1)
              $('#item-qtde').attr('max', json[0].qtde)
            },
            error:function(e){
              msgAlert('Falha ao pesquizar qtde em estoque!', 'erro')
              console.log('erro:'+e)
            }
          })
          $('#item-qtde').focus().select()
        })
      })
  })
  
  $('.btn-select-cliente').click(function() {
    $('.select-content-cliente').toggleClass('active')
      if($('.select-content-cliente').hasClass('active')){
        $('#input-select-cliente').val('')
        $('#input-select-cliente').focus()
      }
      const list = $('#itens-select-cliente').val().split(',')
      $('.options-cliente').find('li').remove()
      $('.options-cliente').append(`<li class="li">Balcão</li>`)
      list.forEach(element => {
        let item = element.split('-')
        let tel = item[1]
        let telMask = '('+tel.substr(1,2)+') '+tel.substr(3,5)+'-'+tel.substr(8)
        $('.options-cliente').append(`<li class="li">${item[0]} - ${telMask}</li>`)
      })
      $('.li').each(function() {
        $(this).click(function() {
          $('.btn-select-cliente span').text($(this).text())
          $('.select-content-cliente').removeClass('active')
        })
      })
  })
  
  $('.btn-select-forn').click(function() {
    $('.select-content-forn').toggleClass('active')
    if($('.select-content-forn').hasClass('active')){
      $('#input-select-forn').val('')
      $('#input-select-forn').focus()
      $('.options-forn').find('li').remove()
      $.ajax({
        url: '/fornecedores/list',
        type: 'POST',
        dataType: 'json',
        success:((json)=> {
          let lista = []
          json.forEach(element => {
            lista.push(`${element.id} - ${element.fornecedor} - ${element.telfornecedor}`)
            $('.options-forn').append(`<li class="li" value="${element.id}">${element.fornecedor} - ${element.telfornecedor}</li>`)
          })
          $('#forn-select').val(lista)
          $('.li').each(function() {
            $(this).click(function() {
              $('.btn-select-forn span').text($(this).text())
              $('#fornecedor').val($(this).text()+' - '+$(this).val())
              $('.select-content-forn').removeClass('active')
              $('#id_forn').val($(this).val())
            })
          })
        })
      })
    }
  })
 
  $('.btn-select-prod').click(function() {
    $('.select-content-prod').toggleClass('active')
    if($('.select-content-prod').hasClass('active')){
      $('#input-select-prod').val('')
      $('#input-select-prod').focus()
      $('.options-prod').find('li').remove()
      $.ajax({
        url: '/estoque/list',
        type: 'POST',
        dataType: 'json',
        success:((json)=> {
          let lista = []
          json.forEach(element => {
            lista.push(`${element.codigo} - ${element.descricao}`)
            $('.options-prod').append(`<li class="li">${element.codigo} - ${element.descricao}</li>`)
          })
          $('#prod-select').val(lista)
          $('.li').each(function() {
            $(this).click(function() {
              $('.btn-select-prod span').text($(this).text())
              $('.select-content-prod').removeClass('active')
              const cod = $('.btn-select-prod span').text().split('-')
              const codigo = cod[0].substring(0 ,cod[0].length - 1)
              $.ajax({
                url: '/estoque/pesq',
                type: 'POST',
                dataType: 'json',
                data: {codigo: codigo},
                success:function(json){
                  $('#id_estoque').val(json[0].id ? json[0].id : '')
                  $('#cod_estoque').val(json[0].codigo ? json[0].codigo: '')
                  $('#desc_estoque').val(json[0].descricao ? json[0].descricao : '')
                  $('#fabricante_estoque').val(json[0].fabricante ? json[0].fabricante : '')
                  $('#qtde_estoque').val(json[0].qtde ? json[0].qtde : '')
                  $('#qtdeMin_estoque').val(json[0].qtdeMin ? json[0].qtdeMin : '')
                  $('#custo_estoque').val(json[0].valor ? String(json[0].valor.toFixed(2)).replace('.',',') : '')
                  $('#custoOrig_estoque').val(json[0].valor ? String(json[0].valor.toFixed(2)).replace('.',',') : '')
                  $('#lucro_estoque').val(json[0].lucro ? json[0].lucro.toFixed(1) : '')
                  $('#venda_estoque').val(json[0].venda ? String(json[0].venda.toFixed(2)).replace('.',',') : '')
                  $('#fornecedor_estoque').focus()
                  $('#btnAtualizar_estoque').removeAttr('disabled')
                  $('#btnAtualizar_estoqueSaida').removeAttr('disabled')
                },
                error:function(e){
                  msgAlert('Falha ao consultar estoque!', 'erro')
                  console.log('erro:'+e)
                }
              })
            })
          })
        })
      })
    }
  })

  $('.btn-select-acesso').click(function() {
    $('.select-content-acesso').toggleClass('active')
      $('.li').each(function() {
        $(this).click(function() {
          $('.btn-select-acesso').val($(this).text())
          $('.select-content-acesso').removeClass('active')
        })
      })
  })

  $('.btn-select-pg').click(function() {
    $('.select-content-pg').toggleClass('active')
      if($('.select-content-pg').hasClass('active')){
        $('#input-select-pg').val('')
        $('#input-select-pg').focus()
        $('.options-pg').find('li').remove()
      }
      const list = $('#formPg-select').val().split(',')
      list.forEach(element => {
        const dados = element.split('-')
        let descItem = dados[2]
        const desc = dados[2] != 0 ? ' - ' +dados[2]+'%' : ''
        $('.options-pg').append(`<li class="li" value=${descItem}>${dados[0]} - ${dados[1]} ${desc}</li>`)
      })
      $('.li').each(function() {
        $(this).click(function() {
          $('.btn-select-pg span').text($(this).text())
          $('.select-content-pg').removeClass('active')
          desconto = ($(this).val())
          const vlDesconto = (valorT - ((valorT / 100) * desconto)).toFixed(2)
          $('#vlTotal').val(String(vlDesconto).replace('.',','))
          valorTotal = vlDesconto
          $('#vlReceb').focus().select()
        })
      })
  })
    
  $('#input-select-forn').keyup(function(e) {
    var text = $(this).val().toUpperCase()
    const list = $('#forn-select').val().split(',')
    const arrFilter = list.filter((item => {
      return item.toUpperCase().includes(text)
    }))
    $('.options-forn').find('li').remove()
    arrFilter.forEach(element => {
      const item = element.split('-')
      $('.options-forn').append(`<li class="li" value="${item[0]}">${item[1]} - ${item[2]}</li>`)
    })
    $('.li').each(function() {
      $(this).click(function() {
        console.log($(this).val())
        $('.btn-select-forn span').text($(this).text())
        $('#fornecedor').val($(this).text()+' - '+$(this).val())
        $('.select-content-forn').removeClass('active')
        $('#id_forn').val($(this).val())
      })
    })
  })
 
  $('#input-select-cliente').keyup(function(e) {
    var text = $(this).val().toUpperCase()
    const list = $('#itens-select-cliente').val().split(',')
    const arrFilter = list.filter((item => {
      return item.toUpperCase().includes(text)
    }))
    $('.options-cliente').find('li').remove()
    $('.options-cliente').append(`<li class="li">Balcão</li>`)
    arrFilter.forEach(element => {
      $('.options-cliente').append(`<li class="li">${element}</li>`)
    })
    $('.li').each(function() {
      $(this).click(function() {
        $('.btn-select-cliente span').text($(this).text())
        $('.select-content-cliente').removeClass('active')
      })
    })
  })

  $('#input-select').keyup(function(e) {
    var text = $(this).val().toUpperCase()
    const list = $('#itens-select').val().split(',')
    const arrFilter = list.filter((item => {
      return item.toUpperCase().includes(text)
    }))
    $('.options').find('li').remove()
    arrFilter.forEach(element => {
      $('.options').append(`<li class="li">${element}</li>`)
    })
    $('.li').each(function() {
      $(this).click(function() {
        $('.btn-select span').text($(this).text())
        $('.select-content').removeClass('active')
        const cod = $('.btn-select span').text().split('-')
          $.ajax({
            url: '/caixa/qtdeEstoque',
            type: 'POST',
            dataType: 'json',
            data:{ codigo: cod[0]},
            success:function(json){
              $('#item-qtde-estoque').val(json[0].qtde)
              $('#item-qtde').val(1)
              $('#item-qtde').attr('max', json[0].qtde)
            },
            error:function(e){
              msgAlert('Falha ao consultar quantidade em estoque!', 'erro')
              console.log('erro:'+e)
            }
          })
        $('#item-qtde').focus().select()
      })
    })
  })

  $('#input-select-prod').keyup(function(e) {
    var text = $(this).val().toUpperCase()
    const list = $('#prod-select').val().split(',')
    const arrFilter = list.filter((item => {
      return item.toUpperCase().includes(text)
    }))
    $('.options-prod').find('li').remove()
    arrFilter.forEach(element => {
      $('.options-prod').append(`<li class="li">${element}</li>`)
    })
    $('.li').each(function() {
      $(this).click(function() {
        $('.btn-select-prod span').text($(this).text())
        $('.select-content-prod').removeClass('active')
        const cod = $('.btn-select-prod span').text().split('-')
        const codigo = cod[0].substring(0 ,cod[0].length - 1)
        $.ajax({
          url: '/estoque/pesq',
          type: 'POST',
          dataType: 'json',
          data:{ codigo: codigo},
          success:function(json){
            $('#id_estoque').val(json[0].id ? json[0].id : '')
                  $('#cod_estoque').val(json[0].codigo ? json[0].codigo: '')
                  $('#desc_estoque').val(json[0].descricao ? json[0].descricao : '')
                  $('#fabricante_estoque').val(json[0].fabricante ? json[0].fabricante : '')
                  $('#qtde_estoque').val(json[0].qtde ? json[0].qtde : '')
                  $('#qtdeMin_estoque').val(json[0].qtdeMin ? json[0].qtdeMin : '')
                  $('#custo_estoque').val(json[0].valor ? String(json[0].valor.toFixed(2)).replace('.',',') : '')
                  $('#custoOrig_estoque').val(json[0].valor ? String(json[0].valor.toFixed(2)).replace('.',',') : '')
                  $('#lucro_estoque').val(json[0].lucro ? json[0].lucro.toFixed(1) : '')
                  $('#venda_estoque').val(json[0].venda ? String(json[0].venda.toFixed(2)).replace('.',',') : '')
                  $('#fornecedor_estoque').focus()
                  $('#btnAtualizar_estoque').removeAttr('disabled')
                  $('#btnAtualizar_estoqueSaida').removeAttr('disabled')
          },
          error:function(e){
            msgAlert('Falha ao buscar dados do item no estoque!', 'erro')
            console.log('erro:'+e)
          }
        })
      })
    })
  })

  $('#input-select-pg').keyup(function(e) {
      var text = $(this).val().toUpperCase()
      const list = $('#formPg-select').val().split(',')
      const arrFilter = list.filter((item => {
        return item.toUpperCase().includes(text)
    }))
    $('.options-pg').find('li').remove()
      arrFilter.forEach(element => {
        const dados = element.split('-')
        let descItem = parseFloat(dados[2])
        const desc = dados[2] != 0 ? ' - ' +dados[2]+'%' : ''
        $('.options-pg').append(`<li class="li" value=${descItem}>${dados[0]} - ${dados[1]} ${desc}</li>`)
    });
    $('.li').each(function() {
      $(this).click(function() {
        $('.btn-select-pg span').text($(this).text())
        $('.select-content-pg').removeClass('active')
        desconto = ($(this).val())
        const vlDesconto = (valorT - ((valorT / 100) * desconto)).toFixed(2)
        $('#vlTotal').val(String(vlDesconto).replace('.',','))
        valorTotal = vlDesconto
        $('#vlReceb').focus().select()
      })
    })
  })

  $('#item-qtde').keyup(function(e){
    const keycode = (e.keyCode ? e.keyCode : e.wich)
    if(keycode == 13){
      const cod = $('.btn-select span').text().split('-')
      const qtde = $('#item-qtde').val()
      $.ajax({
        url: '/caixa/venda',
        type: 'POST',
        dataType: 'json',
        data:{ codigo: cod[0]},
        success:function(json){
          if(json[0].qtde < qtde){
            msgAlert('Quantidade em estoque insulficiente!', 'erro')
            $('#item-qtde').val(1)
          }else {
            const valor = json[0].venda * qtde
            $('tbody').append('<tr>'+
              '<td class="l1">'+cod[0]+'</td>'+
              '<td class="l2">'+cod[1]+'</td>'+
              '<td class="l3">'+qtde+'</td>'+
              '<td class="l4">'+String(json[0].venda.toFixed(2)).replace('.',',')+'</td>'+
              '<td class="l5">'+String(valor.toFixed(2)).replace('.',',')+'</td>'+
              '</tr>')
            $('.btn-select span').text('Selecione um produto')
            $('#item-qtde').val(1)
            $('#item-qtde-estoque').val(0)
            valorT = valorT + valor
            $('#total').val(String(valorT.toFixed(2)).replace('.',','))
            itemCaixa.push(`${json[0].id}-${cod[0]}-${cod[1]}-${qtde}-${valorT}-${json[0].qtde}-${valor}`)
          }
        }
      })
    }
  })

  $('#btnFinalizarCompra').click(function() {
    $('#vlRec').text('Valor a receber')
    if(valorT > 0){
      $('.modal').addClass('active')
    }else msgAlert('Adcione um produto', 'erro')
      valorTotal = valorT
      $('#vlTotal').val(String(valorTotal.toFixed(2)).replace('.',','))
  })

  $('#btnTrocarSenha').click(function() {
    if($(this).text() == 'Resetar senha'){
      $.ajax({
        url:'/usuarios',
        type: 'post',
        dataType: 'json',
        data: {isToggle: 'true', reset: 'true', idUsuario: $('#idUsuarioSelected').val()},
        success: function(json){
          msgAlert(json.msg, json.status)
          $('#cadUsuario').val('').focus()
        }
      })
    }else{
      $('#isToggle').val(true)
      $('.modal').addClass('active')
    }
  })

  $('#btnAlterarSenha').click(function(){
    if($('.modal').hasClass('active')){
      $('#isToggle').val(true)
      if(($('#cadSenha').val() == $('#conf').val()) && $('#cadSenha').val().length > 5){
        $('.modal').removeClass('active')
        $('#form').off('submit').submit()
      }else{
        msgAlert('Senha inválida ou <br> confirmação de senha não confere!', 'erro')
      }
    }
  })

  $('#btnSalvarSenha').click(function(){
      $('#isToggle').val(true)
      if(($('#cadSenha').val() == $('#conf').val()) && $('#cadSenha').val().length > 5){
        $('.modal').removeClass('active')
        $('#form').off('submit').submit()
      }else{
        msgAlert('Senha inválida ou <br> confirmação de senha não confere!', 'erro')
      }
  })
  
  $('#btnConcluir').click(function() {
    if(valorTotal > 0){
      if($('.btn-select-pg span').text() == 'Selecione a forma de pagamento') {
        msgAlert('Selecione a forma de pagamento', 'erro')
      }else if($('#vlReceb').val() <= 0){
        msgAlert('Digite o valor recebido', 'erro')
        $('#vlReceb').focus()
      }else {
        let receb = parseFloat($('#vlReceb').val().replace(',','.'))
        let vlDif = (valorTotal - receb).toFixed(2)
        valorTotal = vlDif
        let tipoPg = $('.btn-select-pg span').text().split('-')
        formPag.push(`${tipoPg[0]} - ${receb}`)
        if(vlDif > 0){
          $('.btn-select-pg span').text('Selecione a forma de pagamento')
          $('#vlReceb').val('')
          $('#vlTotal').val(String((vlDif)).replace('.',','))
        }else if(vlDif < 0) {
          $('#vlRec').text('Troco')
          $('#vlTotal').val(String((vlDif * -1).toFixed(2)).replace('.',','))
          $('#btnConcluir').text('Finalizar')
          $('.btn-select-pg span').text('Selecione a forma de pagamento')
          $('#vlReceb').val('')
        }else if(vlDif == 0) {
          $('#btnConcluir').text('Finalizar')
          $('.btn-select-pg span').text('Selecione a forma de pagamento')
          $('#vlReceb').val('')
          $('#vlTotal').val('0,00')
        }
      }
    }else if(valorTotal <= 0){
      $('.modal').removeClass('active')
      if($('.btn-select-cliente span').text() != 'Balcão'){
        let cliente = $('.btn-select-cliente span').text()
        let cli = cliente.substr(-14).replace(/[^0-9]/g,'')
        $.ajax({
          url: '/clientes/pesTel',
          type: 'post',
          dataType: 'json',
          data: {tel: cli},
          success: function(json){
            if(json.status){
              let idCliente =  json.dados.id
              finalizarCompra(itemCaixa, formPag, valorT, desconto, idCliente)
            }else {
              msgAlert('Falha ao buscar dados do cliente', 'erro')
            }
          }
        })
      }else {
        finalizarCompra(itemCaixa, formPag, valorT, desconto, 0)
      }
    }
  })

  $('#btnVoltar').click(function() {
    $('.modal').removeClass('active')
    $('.btn-select-pg span').text('Selecione a forma de pagamento')
    $('#vlReceb').val('')
  })

  $('#vlReceb').keyup(function(e){
    $(this).mask('999.999.999.990,00', {reverse: true})
  })

  $('#fornecedor_estoque').keyup(function(e){
    const keycode = (e.keyCode ? e.keyCode : e.wich)
    if(keycode == 13){
      $('#nota_estoque').focus().select()
    }
  })

  $('#nota_estoque').keyup(function(e){
    const keycode = (e.keyCode ? e.keyCode : e.wich)
    if(keycode == 13){
      $('#custo_estoque').focus().select()
    }
  })

  $('#custo_estoque').keyup(function(e){
    const keycode = (e.keyCode ? e.keyCode : e.wich)
    if(keycode == 13){
      $('#lucro_estoque').focus().select()
    }
  })

  $('#lucro_estoque').keyup(function(e){
    const keycode = (e.keyCode ? e.keyCode : e.wich)
    if(keycode == 13){
      $('#qtdeInsert_estoque').focus().select()
    }
  })

  $('#btnItens').click(function(){
    $('.tab-fechaItens').toggleClass('active')
    if($('.tab-fechaItens').hasClass('active')){
      $(this).text("Ocultar itens das vendas")
      $('.venda').find('tr').remove()
      $('.tbody-caixa').find("td.lf1").each(function(){
        let venda = $(this).text()
        $.ajax({
          url: 'fecha/itens',
          dataType: 'json',
          type: 'post',
          data: {venda: venda},
          success:function(json){
            json.forEach(e => {
              $('tbody').find('.venda').each(function(){
                if(e.id == $(this).attr('venda')){
                  $(this).append(`<tr>
                    <td class="lf11" >${e.codigo} - ${e.descricao}</td>
                    <td class="lf2" >${e.qtdeitem}</td>
                    <td class="lf3" >${parseFloat(e.valorItem).toFixed(2).replace('.',',')}</td>
                    </tr>`
                  )
                }
              })
            })
          }
        })
      })
    }else $(this).text("Visualizar itens das vendas")
  })

  $('#fechaCaixa').click(function(){
    $.ajax({
      url: 'fecha/caixa',
      type: 'post',
      success: function(json){
        msgAlert(json.msg, json.tipo)
        setTimeout(() => {
          location.assign('/caixa')
        }, 3000);
      }
    })
  })

  $('#btnRelatorioCaixa').click(function(){
    if($('#dateIni').val() == '' || $('#dateFim').val() == ''){
      msgAlert('Dados obrigatórios', 'erro')
    }else
      $('#form').off('submit').submit()
  })

  $('#btnRelatorioLucro').click(function(){
    if($('#dateIni').val() == '' || $('#dateFim').val() == ''){
      msgAlert('Dados obrigatórios', 'erro')
    }else
      $('#form').off('submit').submit()
  })

  $('#btnSalvarSaida').click(function(){
    if($('#motivoSaida').val().length < 4 )
      msgAlert('Motivo Obrigatório!', 'erro')
    else if ($('#vlSaida').val() < 1)
      msgAlert('Valor inválido!', 'erro')
    else
    $('#form').off('submit').submit()

  })

  $('#btnRelatorioEstoque').click(function(){
    if($('#dateIni').val() == '' || $('#dateFim').val() == ''){
      msgAlert('Dados obrigatórios', 'erro')
    }else
      $('#form').off('submit').submit()
  })

  $('#btnSalvarFormPag').click(function() {
    if(validarFormPag())
    $('#form').off('submit').submit()
  })

  $('#btnSalvarCF').click(function() {
    console.log($('#dataCF').val())
    if($('#descricaoCF'). val().length < 4)
      msgAlert('Descrição inválida!', 'erro')
    else if($('#dataCF').val() == '')
      msgAlert('Data obrigatória!', 'erro')
    else if($('#valorCF').val() < 1)
      msgAlert('Valor inválido!', 'erro')
    else
      $('#form').off('submit').submit()
  })

  function validarFormPag() {
    if($('#formCodigo').val().length < 3){
      msgAlert('Código inválido!', 'erro')
      return false
    }else if($('#formDescricao').val().length < 3){
      msgAlert('Descrição inválida!', 'erro')
      return false
    }
    return true
  }

  function calcularVenda(custo, lucro) {
    let venda = ((custo / 100) * lucro)
    let total = venda + custo
    $('#venda_estoque').val(total.toFixed(2).replace('.', ','))
  }

  function validarEstoque(){
    if($('#codigo_estoque').val().length < 3 ) {
      msgAlert('Código inválido! <br> Min de 3, Max de 12 caracteres', 'erro')
      return false
    }else if($('#descricao_estoque').val().length < 5) {
      msgAlert('Descrição inválida! <br> Minimo de 5 caracteres', 'erro')
      return false
    }else if($('#fabricante_estoque').val().length < 3) {
      msgAlert('Fabricante inválido! <br> Minimo de 3 caracteres', 'erro')
      return false
    }
    return true
  }

  function validarCPF(strCpf) {
    strCpf = strCpf.replace(/[^0-9]/g,'')
    let soma;
    let resto;
    soma = 0;
    const cpf_falso = [
        "00000000000",
        "11111111111",
        "22222222222",
        "33333333333",
        "44444444444",
        "55555555555",
        "66666666666",
        "77777777777",
        "88888888888",
        "99999999999"
    ]

    let verificado = cpf_falso.indexOf(strCpf)

    if (verificado > 0) {
        return false;
    }
    
    for (i = 1; i <= 9; i++) {
        soma = soma + parseInt(strCpf.substring(i - 1, i)) * (11 - i);
    }
    
    resto = soma % 11;
    
    if (resto == 10 || resto == 11 || resto < 2) {
        resto = 0;
    } else {
        resto = 11 - resto;
    }
    
    if (resto != parseInt(strCpf.substring(9, 10))) {
        return false;
    }
    
    soma = 0;
    
    for (i = 1; i <= 10; i++) {
        soma = soma + parseInt(strCpf.substring(i - 1, i)) * (12 - i);
    }
    resto = soma % 11;
    
    if (resto == 10 || resto == 11 || resto < 2) {
        resto = 0;
    } else {
        resto = 11 - resto;
    }
    
    if (resto != parseInt(strCpf.substring(10, 11))) {
        return false;
    }
    
    return true;
  }

  function validarUsuario() {
    if($('#nomeUsuario').val().length < 5){
      msgAlert('Nome inválido', 'erro')
      $('#nomeUsuario').focus()
      return false
    }else if($('#cadUsuario').val().length < 5 || $('#cadUsuario').val().length > 8){
      msgAlert('Usuario inválido', 'erro')
      $('#usuario').focus()
      return false
    }else if($('#cpfUsuario').val().length < 14){
      msgAlert('CPF inválido', 'erro')
      $('#cpfUsuario').focus()
      return false
    }else if($('#emailUsuario').val().length < 10){
      msgAlert('Email inválido', 'erro')
      $('#email').focus()
      return false
    }else if($('#nivelAcesso').val() == ''){
      msgAlert('Nivel de acesso inválido', 'erro')
      $('#nivelAcesso').focus()
      return false
    }
    return true
  }

  function validarCliente() {
    if($('#nomeCliente').val().length < 5) {
      msgAlert('Nome inválido! (Minimo de 5 caracteres)', 'erro')
      return false
    }else if($('#telCliente').val().length < 14){
      msgAlert('Telefone inválido!', 'erro')
      return false
    }
    return true
  }

  function validarFornecedor() {
    if($('#telFornecedor').val().length < 3){
      msgAlert('Telefone Obrigatório', 'erro')
      return false
    }else if($('#nomeFornecedor').val().length < 3){
      msgAlert('Nome Obrigatório', 'erro')
      return false
    }else if($('#contatoFornecedor').val().length < 3){
      msgAlert('Contato Obrigatório', 'erro')
      return false
    }
    return true
  }  

  function finalizarCompra(item, formPg, valorT, desconto, idCliente) {
    let itens = []
    item.forEach((it) => {
      itens.push(it.split('-'))
    })
    $.ajax({
      url: '/caixa/finVenda',
      type: 'POST',
      dataType: 'json',
      data:{ itens, formPg, valorT, desconto, idCliente},
      success:function(json){
        if(json.status){
          msgAlert(json.msg, 'sucesso')
          $('.tbody').find('tr').remove()
          $('#total').val('0,00')
          valorT = 0
          itemCaixa = []
          setTimeout(() => {
            location.reload()
          }, 3000);
        }else{
          msgAlert(json.msg, 'erro')
          $('.tbody').find('tr').remove()
        }
      }
    })
  }
})