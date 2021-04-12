import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';

import { useAuth } from '../../hooks/auth';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Button from '../../components/Button';

enum TipoTransacao {
  ENVIO_TRANSFERENCIA = 0,
  RECEBIMENTO_TRANSFERENCIA = 1,
  PAGAMENTO = 2,
  DEPOSITO = 3,
}

function transacaoEhPositiva(tipoTransacao: number) {
  switch (tipoTransacao) {
    case TipoTransacao.ENVIO_TRANSFERENCIA: return false;
    case TipoTransacao.RECEBIMENTO_TRANSFERENCIA: return true;
    case TipoTransacao.PAGAMENTO: return false;
    case TipoTransacao.DEPOSITO: return true;
  }
}

function descricaoTransacao(tipoTransacao: number) {
  switch (tipoTransacao) {
    case TipoTransacao.ENVIO_TRANSFERENCIA: return 'transferência enviada';
    case TipoTransacao.RECEBIMENTO_TRANSFERENCIA: return 'transferência recebida';
    case TipoTransacao.PAGAMENTO: return 'pagamento';
    case TipoTransacao.DEPOSITO: return 'depósito';
  }
}

const ConsultarServicosRealizados: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [ tipoConta, setTipoConta ] = useState(null as string | null);
  const [ filtro, setFiltro ] = useState(0);

  useEffect(() => {
    if (tipoConta) {
      navigation.setOptions({title: `Extrato ${tipoConta}`})

      if (tipoConta == 'Conta Corrente' && user.contaCorrente.__transacoes__.length === 0) {
        Alert.alert('Não há transações realizadas.')
      }
    }
  }, [tipoConta])

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      {!tipoConta ? (
        <>
          <Text style={{ color: 'white', fontSize: 20 }}>Selecione o tipo de conta</Text>
          <Button onPress={()=>setTipoConta('Conta Corrente')}>Conta Corrente</Button>
          <Button onPress={()=>Alert.alert('Em construção...')}>Poupança</Button>
          <Button onPress={()=>Alert.alert('Em construção...')}>Investimento</Button>
        </>
      ) : (
        <>
          <View style={{display: "flex", flexDirection: "row", width: "100%", marginBottom: 20}}>
            <TouchableOpacity onPress={()=>setFiltro(0)} containerStyle={{flex:1, backgroundColor: filtro === 0 ? 'lightgray' : 'white', padding: 16, borderColor: 'lightgray', borderWidth: 1}}>
              <Text style={{textAlign:"center"}}>Todos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setFiltro(1)} containerStyle={{flex:1, backgroundColor: filtro === 1 ? 'lightgray' : 'white', padding: 16, borderColor: 'lightgray', borderWidth: 1}}>
              <Text style={{textAlign:"center"}}>Entradas</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setFiltro(2)} containerStyle={{flex:1, backgroundColor: filtro === 2 ? 'lightgray' : 'white', padding: 16, borderColor: 'lightgray', borderWidth: 1}}>
              <Text style={{textAlign:"center"}}>Saídas</Text>
            </TouchableOpacity>
          </View>
          <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", paddingHorizontal: 20, paddingVertical: 10}}>
            <Text style={{ color: 'white', fontWeight: "bold" }}>Data - Descrição</Text>
            <Text style={{ color: 'white', fontWeight: "bold" }}>Valor</Text>
          </View>
          {user.contaCorrente.__transacoes__.filter(transacao => filtro === 0 || filtro === 1 && transacaoEhPositiva(transacao.tipo) || filtro === 2 && !transacaoEhPositiva(transacao.tipo)).reverse()
          .map(transacao => (
            <View key={transacao.id} style={{display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", paddingHorizontal: 20, paddingVertical: 10}}>
              <Text style={{ color: transacaoEhPositiva(transacao.tipo) ? 'green' : 'red', fontWeight: "bold" }}>{new Date(transacao.data_hora).getDate()}/{new Date(transacao.data_hora).getMonth()+1} - {descricaoTransacao(transacao.tipo)}</Text>
              <Text style={{ color: transacaoEhPositiva(transacao.tipo) ? 'green' : 'red', fontWeight: "bold" }}>R$ {transacao.valor.toFixed(2)}</Text>
            </View>
          ))}
        </>
      )}
    </View>
  );
};

export default ConsultarServicosRealizados;
