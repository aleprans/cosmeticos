function msgAlert(text, tipo) {
  $('#msgtext').append(text)
    $('#msg').css('visibility','visible' )
    if(tipo == 'erro'){
      $('#msg').css('border-color','#f00' )
      $('#msg').css('background','#f1606030' )
    }else if(tipo == 'sucesso'){
      $('#msg').css('border-color','#0f0' )
      $('#msg').css('background','#79f07f30' )
    }
    setTimeout(function()
      {$('#msgtext').text('')
      $('#msg').css('visibility', 'hidden')}
    ,5000)
}

$(document).ready(() => {
  $('#form').submit((e)=> {
    e.preventDefault()
  })
  var resp = $('.invisible').text().split(',')
  
  if(resp.length > 1) {
    msgAlert(resp[1], resp[0])}
})

$('#btnSalvar_estoque').click(function() {
  if(validar()) {
    $('#form').off('submit').submit()
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
      $('#input-select').focus()
    }
    const list = $('#itens-select').val().split(',')
    list.forEach(element => {
      $('.options').append(`<li class="li">${element}</li>`)
    })
    $('.li').each(function() {
      $(this).click(function() {
        $('.btn-select span').text($(this).text())
        $('.select-content').removeClass('active')
      })
    })
  })
  
  $('#input-select').keyup(function() {
    var text = $(this).val()
    const list = $('#itens-select').val().split(',')
    const arrFilter = list.filter((item => {
      return item.includes(text)
  }))
  $('.options').find('li').remove()
    arrFilter.forEach(element => {
      $('.options').append(`<li class="li">${element}</li>`)
  });
  $('.li').each(function() {
    $(this).click(function() {
      $('.btn-select span').text($(this).text())
      $('.select-content').removeClass('active')
    })
  })
})

function calcularVenda(custo, lucro) {
  let venda = ((custo / 100) * lucro)
  let total = venda + custo
  $('#venda_estoque').val(total.toFixed(2).replace('.', ','))
}

function validar(){
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
