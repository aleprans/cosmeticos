function msgAlert(text, tipo) {
  $('#msgtext').append(text)
    $('#msg').css('visibility','visible' )
    if(tipo == 'erro'){
      $('#msg').css('border-color','#f00' )
      $('#msg').css('background','#f16060' )
    }else if(tipo == 'sucesso'){
      $('#msg').css('border-color','#0f0' )
      $('#msg').css('background','#79f07f' )
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
  var valorT = 0
  var itemCaixa = []
  var resp = $('.invisible').text().split(',')
  
  if(resp.length > 1) {
    msgAlert(resp[1], resp[0])}

$('#usuario').keyup(function(e){
  const keycode = (e.keyCode ? e.keyCode : e.wich)
  if(keycode == 13){
    $('#senhaLogin').focus()
  }
})

$('#btnSalvar_estoque').click(function() {
  if(validarEstoque()) {
    $('#form').off('submit').submit()
  }
})

$('#btnSalvarUsuario').click(function() {
  if(validarUsuario())
    $('#form').off('submit').submit()
})

$('#cpfUsuario').keyup(function(){
  $(this).mask('999.999.999-99')
})

$('#cpfUsuario').blur(function() {
  if($(this).val().length != 14 || validarCPF($(this).val()) === false){
    msgAlert('CPF inválido!', 'erro')
    $(this).focus()
  }
})

$('#nomeUsuario').blur(function() {
  if($(this).val().length < 5) {
    msgAlert('Nome inválido! <br> Minimo 5 caracteres', 'erro')
    $(this).focus()
  }
})

$('#cadUsuario').blur(function() {
  if($(this).val().length < 5) {
    msgAlert('Nome de usuario inválido! <br> Minimo 5 caracteres', 'erro')
    $(this).focus()
  }
})

$('#btnAtualizar_estoque').click(function() {
  if($('#qtdeInsert_estoque').val() == 0 || $('#qtdeInsert_estoque').val() == null)
    msgAlert('Quantidade inválida!', 'erro')
  else
    $('#form').off('submit').submit()
})

$('#codigo_estoque').keyup(function() {
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

})

$('#codigoEntSai_estoque').blur(
  function(){
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
            $('#custo_estoque').val(json[0].custo)
            $('#lucro_estoque').val(json[0].lucro)
            $('#venda_estoque').val(json[0].venda)
            $('#id_estoque').val(json[0].id)
            $('#isSave_estoque').val('false')
            $('#btnAtualizar_estoque').removeAttr('disabled')
          }else { 
            msgAlert('Produto não encontrado', 'erro')
            $('#codigoEntSai_estoque').focus()
            $('#btnAtualizar_estoque').attr('disabled', 'true')
          }
        },
        error:function(e) {
          msgAlert('Erro ao recuperar dados', 'erro')
        } 
      })
    }
  }
)

$('#codigo_estoque').blur(function(){
  const dado = $(this).val()
  if(dado) {
    $.ajax({
      url: '/estoque/pesq',
      type: 'POST',
      dataType: 'json',
      data:{ codigo: dado},
      success:function(json){
        $('#descricao_estoque').val(json[0].descricao)
        $('#fabricante_estoque').val(json[0].fabricante)
        $('#qtde_estoque').val(json[0].qtde)
        $('#qtde_estoque').attr('disabled','true')
        $('#custo_estoque').val(json[0].custo)
        $('#lucro_estoque').val(json[0].lucro)
        $('#venda_estoque').val(json[0].venda)
        $('#id_estoque').val(json[0].id)
        $('#isSave_estoque').val('false')
      },
      error:function(e) {
        msgAlert('Erro ao recuperar dados', 'erro')
      } 
    })
  }
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
            console.log('erro:'+e)
          }
        })
        $('#item-qtde').focus().select()
      })
    })
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
    }
    const list = $('#formPg-select').val().split(',')
    list.forEach(element => {
      $('.options-pg').append(`<li class="li">${element}</li>`)
    })
    $('.li').each(function() {
      $(this).click(function() {
        $('.btn-select-pg span').text($(this).text())
        $('.select-content-pg').removeClass('active')
        $('#vlTotal').focus().select()
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
            console.log('erro:'+e)
          }
        })
      $('#item-qtde').focus().select()
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
      $('.options-pg').append(`<li class="li">${element}</li>`)
  });
  $('.li').each(function() {
    $(this).click(function() {
      $('.btn-select-pg span').text($(this).text())
      $('.select-content-pg').removeClass('active')
      $('#vlTotal').focus().select()
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
          let venda = json[0].venda.replace(',','.')
          const valor = venda * qtde
          $('tbody').append('<tr>'+
            '<td class="l1">'+cod[0]+'</td>'+
            '<td class="l2">'+cod[1]+'</td>'+
            '<td class="l3">'+qtde+'</td>'+
            '<td class="l4">'+venda+'</td>'+
            '<td class="l5">'+valor.toFixed(2)+'</td>'+
            '</tr>')
          $('.btn-select span').text('Selecione um produto')
          $('#item-qtde').val(1)
          valorT = valorT + valor
          $('#total').val(valorT.toFixed(2))
          itemCaixa.push(`${json[0].id}-${cod[0]}-${cod[1]}-${qtde}-${valorT}-${json[0].qtde}`)
        }
      }
    })
  }
})

$('#btnFinalizarCompra').click(function() {
  if(valorT> 0)
    $('.modal').addClass('active')
    $('#vlTotal').val(valorT.toFixed(2))
})

$('#vlTotal').keyup(function(e){
  let tipoPg = $('.btn-select-pg span').text().split('-')
  const keycode = (e.keyCode ? e.keyCode : e.wich)
  $(this).mask('999.999.999.990,00', {reverse: true})
  if(keycode == 13){
    $('.modal').removeClass('active')
    finalizarCompra(itemCaixa, tipoPg )
  }
})

function calcularVenda(custo, lucro) {
  let venda = ((custo / 100) * lucro)
  let total = venda + custo
  $('#venda_estoque').val(total.toFixed(2).replace('.', ','))
}

function validarEstoque(){
  if($('#codigo_estoque').val().length < 3 || $('#codigo_estoque').val().length > 12) {
    msgAlert('Código inválido! <br> Min de 3 Max de 12 caracteres', 'erro')
    return false
  }else if($('#descricao_estoque').val().length < 5) {
    msgAlert('Descrição inválida! <br> Minimo de 5 caracteres', 'erro')
    return false
  }else if($('#fabricante_estoque').val().length < 5) {
    msgAlert('Fabricante inválido! <br> Minimo de 5 caracteres', 'erro')
    return false
  }else if($('#custo_estoque').val() < 1) {
    msgAlert('Custo inválido!', 'erro')
    return false
  }else if($('#lucro_estoque').val() < 1) {
    msgAlert('Lucro inválido!ee', 'erro')
    return false
  }else if($('#qtde_estoque').val() < 1) {
    msgAlert('Quantidade inválida!', 'erro')
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
  }else if($('#email').val().length < 10){
    msgAlert('Email inválido', 'erro')
    $('#email').focus()
    return false
  }else if($('#nivelAcesso').val() == ''){
    msgAlert('Nivel de acesso inválido', 'erro')
    $('#nivelAcesso').focus()
    return false
  }else if($('#senha').val().length < 6){
    msgAlert('Senha inválida', 'erro')
    $('#senha').focus()
    return false
  }else if($('#conf').val() != $('#senha').val()){
    msgAlert('Confirmação de senha inválida', 'erro')
    $('#conf').focus()
    return false
  }
  return true
}

function finalizarCompra(item, formPg) {
  let itens = []
  item.forEach((it) => {
    itens.push(it.split('-'))
  })
  $.ajax({
    url: '/caixa/finVenda',
    type: 'POST',
    dataType: 'json',
    data:{ itens, formPg, valorT},
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