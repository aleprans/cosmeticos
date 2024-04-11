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

  $('#btnSalvar_estoque').click(function() {
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

  $('#btnCancelAlterarSenha').click(function(){
    $('.modal').removeClass('active')
  })

  $('#btnSalvarCliente').click(function() {
    if(validarCliente())
      $('#form').off('submit').submit()
  })

  $('#cpfUsuario').keyup(function(){
    $(this).mask('999.999.999-99')
  })

  $('#cpfCliente').keyup(function(){
    $(this).mask('999.999.999-99')
  })

  $('#telCliente').keyup(function(){
    $(this).mask('(99) 99999-9999')
  })

  $('#telCliente').change(function(){
    $(this).mask('(99) 99999-9999')
  })

  $('#cpfUsuario').focus(function() {
    $('#nomeCliente').val('')
    $('#emailCliente').val('')
    $('#enderecoCliente').val('')
    $('#telCliente').val('')
    $('#idCliente').val('')
  })

  $('#cpfCliente').blur(function() {
    if($(this).val().length != 14 || validarCPF($(this).val()) === false){
      msgAlert('CPF inválido!', 'erro')
      $(this).focus()
    }
    $.ajax({
      url: '/clientes/pesCPF',
      type: 'post',
      dataType: 'json',
      data: {cpf: $(this).val()},
      success: function(json){
        if(json.status){
          $('#nomeCliente').val(json.dados.nome)
          $('#emailCliente').val(json.dados.email)
          $('#enderecoCliente').val(json.dados.endereco)
          $('#telCliente').val(json.dados.telefone)
          $('#isInsert').val(false)
          $('#idCliente').val(json.dados.id)
          $('#telCliente').focus()
        }else {
          $('#isInsert').val(true)
          $('#nomeCliente').focus()
        }
      }
    })
  })

  $('#nomeCliente').blur(function() {
    if($(this).val().length < 5) {
      msgAlert('Nome inválido! <br> Minimo 5 caracteres', 'erro')
      $(this).focus()
    }
  })

  $('#btnAtualizar_estoque').click(function() {
    if($('#qtdeInsert_estoque').val() < 1 || $('#qtdeInsert_estoque').val() == null)
      msgAlert('Quantidade inválida!', 'erro')
    else
      $('#form').off('submit').submit()
  })

  $('#btnAtualizar_estoqueSaida').click(function() {
    if($('#qtdeSaida_estoque').val() < 1 || $('#qtdeSaida_estoque').val() == null)
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
            $('#lucro_estoque').val(json[0].lucro)
            $('#venda_estoque').val(json[0].venda)
            $('#id_estoque').val(json[0].id)
            $('#qtdeMin_estoque').val(json[0].qtdeMin)
            $('#isSave_estoque').val('false')
          }else {
            $('#qtde_estoque').removeAttr('readonly')
          }
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
        let cpf = item[1]
        let cpfMask = cpf.substr(0,4)+'.'+cpf.substr(4,3)+'.'+cpf.substr(7, 3)+'-'+cpf.substr(10)
        $('.options-cliente').append(`<li class="li">${item[0]} - ${cpfMask}</li>`)
      })
      $('.li').each(function() {
        $(this).click(function() {
          $('.btn-select-cliente span').text($(this).text())
          $('.select-content-cliente').removeClass('active')
        })
      })
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
                  $('#id_estoque').val(json[0].id)
                  $('#cod_estoque').val(json[0].codigo)
                  $('#desc_estoque').val(json[0].descricao)
                  $('#fabricante_estoque').val(json[0].fabricante)
                  $('#qtde_estoque').val(json[0].qtde)
                  $('#qtdeMin_estoque').val(json[0].qtdeMin)
                  $('#custo_estoque').val(json[0].custo)
                  $('#lucro_estoque').val(json[0].lucro)
                  $('#venda_estoque').val(json[0].venda)
                  $('#fornecedor_estoque').focus()
                  $('#btnAtualizar_estoque').removeAttr('disabled')
                  $('#btnAtualizar_estoqueSaida').removeAttr('disabled')
                },
                error:function(e){
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
          $('#btnConcluir').text('Finalizar')
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
            $('#id_estoque').val(json[0].id)
            $('#cod_estoque').val(json[0].codigo)
            $('#desc_estoque').val(json[0].descricao)
            $('#fabricante_estoque').val(json[0].fabricante)
            $('#qtde_estoque').val(json[0].qtde)
            $('#qtdeMin_estoque').val(json[0].qtdeMin)
            $('#custo_estoque').val(json[0].custo)
            $('#lucro_estoque').val(json[0].lucro)
            $('#venda_estoque').val(json[0].venda)
            $('#fornecedor_estoque').focus()
            $('#btnAtualizar_estoque').removeAttr('disabled')
            $('#btnAtualizar_estoqueSaida').removeAttr('disabled')
          },
          error:function(e){
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
        $('.options-pg').append(`<li class="li">${element}</li>`)
    });
    $('.li').each(function() {
      $(this).click(function() {
        $('.btn-select-pg span').text($(this).text())
        $('.select-content-pg').removeClass('active')
        $('#vlTotal').focus().select()
        $('#btnConcluir').text('Finalizar')
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
            let venda = String(json[0].venda).replace('.',',')
            $('tbody').append('<tr>'+
              '<td class="l1">'+cod[0]+'</td>'+
              '<td class="l2">'+cod[1]+'</td>'+
              '<td class="l3">'+qtde+'</td>'+
              '<td class="l4">'+venda+'</td>'+
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
    if(valorT> 0)
      $('.modal').addClass('active')
    else msgAlert('Adcione um produto', 'erro')
      $('#vlTotal').val(valorT.toFixed(2))
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
    // if($('.modal').hasClass('active')){
      $('#isToggle').val(true)
      if(($('#cadSenha').val() == $('#conf').val()) && $('#cadSenha').val().length > 5){
        $('.modal').removeClass('active')
        $('#form').off('submit').submit()
      }else{
        msgAlert('Senha inválida ou <br> confirmação de senha não confere!', 'erro')
      }
    // }
  })
  
  $('#btnConcluir').click(function() {
    if($('.btn-select-pg span').text() != 'Selecione a forma de pagamento') {
      let tipoPg = $('.btn-select-pg span').text().split('-')
      let vlTotal = $('#vlTotal').val()
      $('.modal').removeClass('active')
      if($('.btn-select-cliente span').text() != 'Balcão'){
        let cliente = $('.btn-select-cliente span').text()
        let cli = cliente.substr(-14).replace(/[^0-9]/g,'')
        $.ajax({
          url: '/clientes/findCpf',
          type: 'post',
          dataType: 'json',
          data: {cpf: cli},
          success: function(json){
            if(json.status){
              console.log(json.result[0].id)
              let idCliente =  json.result[0].id
              finalizarCompra(itemCaixa, tipoPg, vlTotal, idCliente )
            }
          }
        })
      }else {
        finalizarCompra(itemCaixa, tipoPg, vlTotal, 0)
      }
    }else {
      msgAlert('Selecione a forma de pagamento', 'erro')
    }
  })

  $('#btnVoltar').click(function() {
    $('.modal').removeClass('active')
  })

  $('#vlTotal').keyup(function(e){
    $(this).mask('999.999.999.990,00', {reverse: true})
    let tipoPg = $('.btn-select-pg span').text().split('-')
    let vlTotal = $(this).val()
    const keycode = (e.keyCode ? e.keyCode : e.wich)
    if(keycode == 13){ 
      $('.modal').removeClass('active')
      if($('.btn-select-cliente span').text() != 'Balcão'){
        let cliente = $('.btn-select-cliente span').text().split('-')
        let cli = cliente[1].replace(/[^0-9]/g,'')
        $.ajax({
          url: '/clientes/findCpf',
          type: 'post',
          dataType: 'json',
          data: {cpf: cli},
          success: function(json){
            if(json.status){
              console.log(json.result[0].id)
              var idCliente = json.result[0].id
              finalizarCompra(itemCaixa, tipoPg, vlTotal, idCliente )
            }
          }
        })
      }else {
        finalizarCompra(itemCaixa, tipoPg, vlTotal, 0 )
      }
    }
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
    if($('#idVenda').val() > 0) {
      
    }
  })

  $('#btnRelatorioCaixa').click(function(){
    if($('#dateIni').val() == '' || $('#dateFim').val() == ''){
      msgAlert('Dados obrigatórios', 'erro')
    }else
      $('#form').off('submit').submit()
  })

  $('#btnRelatorioEstoque').click(function(){
    if($('#dateIni').val() == '' || $('#dateFim').val() == ''){
      msgAlert('Dados obrigatórios', 'erro')
    }else
      $('#form').off('submit').submit()
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
      msgAlert('Lucro inválido!', 'erro')
      return false
    }else if($('#qtdeMin_estoque').val() < 0) {
      msgAlert('Qtde minima inválida!', 'erro')
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
      msgAlert('Nome inválido! <br> Minimo de 5 caracteres', 'erro')
      return false
    }else if($('#emailCliente').val().length < 10){
      msgAlert('Email inválido! <br> Minimo de 10 caracteres', 'erro')
      return false
    }else if($('#telCliente').val().length < 14){
      msgAlert('Telefone inválido!', 'erro')
      return false
    }
    return true
  }

  function finalizarCompra(item, formPg, vlTotal, idCliente) {
    // console.log(idCliente)
    let itens = []
    item.forEach((it) => {
      itens.push(it.split('-'))
    })
    $.ajax({
      url: '/caixa/finVenda',
      type: 'POST',
      dataType: 'json',
      data:{ itens, formPg, valorT, vlTotal, idCliente},
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