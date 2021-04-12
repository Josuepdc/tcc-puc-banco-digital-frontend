import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Home from '../pages/Home';
import TransferirValores from '../pages/TransferirValores';
import RealizarPagamento from '../pages/RealizarPagamento';
import ConsultarServicosRealizados from '../pages/ConsultarServicosRealizados';

const App = createStackNavigator();

const AppRoutes: React.FC = () => (
  <App.Navigator
    screenOptions={{
      headerShown: true,
      cardStyle: { backgroundColor: '#312e38' },
    }}
  >
    <App.Screen name="Home" component={Home} />
    <App.Screen name="Transferir valores" component={TransferirValores} />
    <App.Screen name="Realizar pagamento" component={RealizarPagamento} />
    <App.Screen name="Consultar servicos realizados" component={ConsultarServicosRealizados} />
  </App.Navigator>
);

export default AppRoutes;
