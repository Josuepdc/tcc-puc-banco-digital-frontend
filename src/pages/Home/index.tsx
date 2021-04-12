import React from 'react';
import { View, Text } from 'react-native';

import { useAuth } from '../../hooks/auth';
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button';

const Home: React.FC = () => {
  const { signOut, user } = useAuth();
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'white', fontSize: 20 }}>Nome:</Text>
      <Text style={{ color: 'white', fontSize: 30 }}>{user && user.contaCorrente && user.contaCorrente.__correntista__.nome}</Text>
      <Text style={{ color: 'white', fontSize: 20 }}>Saldo conta corrente:</Text>
      <Text style={{ color: 'white', fontSize: 40 }}>R$ {user && user.contaCorrente && user.contaCorrente.saldo.toFixed(2)}</Text>
      <Button onPress={()=>navigation.navigate('Transferir valores')}>Transferir valores</Button>
      <Button onPress={()=>navigation.navigate('Realizar pagamento')}>Realizar pagamento</Button>
      <Button onPress={()=>navigation.navigate('Consultar servicos realizados')}>Consultar serviços realizados</Button>
      <Button onPress={signOut}>Sair</Button>
    </View>
  );
};

export default Home;
