import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, KeyboardAvoidingView, Alert } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';

import { Container } from './styles';
import { FormHandles } from '@unform/core';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Form } from '@unform/mobile';
import getValidationErrors from '../../utils/getValidationErrors';
import api from '../../services/api';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/auth';

interface FormData {
  codigoDoBoleto: string
  tipoDeImposto: string
  telefone: string
  valorDeRecarga: number
  password: string;
}

const RealizarPagamento: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigation = useNavigation();
  const [ infoPagamento, setInfoPagamento ] = useState({});
  const [ tipoPagamento, setTipoPagamento ] = useState(null as string | null);

  const formRef = useRef<FormHandles>(null);

  const handleCodigoBoletoBlur = async function(e) {
    const res = await api.post('/pagamento/boleto/consultar', {
      codigoBoleto: e.nativeEvent.text
    }, {
      headers: {
        correntista_id: user.contaCorrente.__correntista__.id
      }
    });

    setInfoPagamento(res.data);
  };

  const handleSubmit = useCallback(
    async (data: FormData) => {
      try {
        formRef.current?.setErrors({});

        if (tipoPagamento != "Boleto") {
          return Alert.alert(
            'Por enquanto só pagamento de boleto.',
          );
        }

        const schema = Yup.object().shape({
          codigoDoBoleto: Yup.string().required('Código do boleto obrigatório.'),
          password: Yup.string().required('Campo obrigatório.'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        await api.post('/pagamento/boleto/pagar', {
          codigoBoleto: data.codigoDoBoleto
        }, {
          headers: {
            correntista_id: user.contaCorrente.__correntista__.id
          }
        });

        updateUser();

        Alert.alert("Pagamento realizado com sucesso!");

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        Alert.alert(errerror);
      }
    },
    [navigation, tipoPagamento],
  );

  useEffect(() => {
    if (tipoPagamento) {
      navigation.setOptions({title: `Pagar ${tipoPagamento}`})
    }
  }, [tipoPagamento])

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      {!tipoPagamento ? (
        <>
          <Text style={{ color: 'white', fontSize: 20 }}>Selecione o tipo de conta</Text>
          <Button onPress={()=>setTipoPagamento('Boleto')}>Boleto</Button>
          <Button onPress={()=>setTipoPagamento('Imposto')}>Imposto</Button>
          <Button onPress={()=>setTipoPagamento('Recarga de celular')}>Recarga de celular</Button>
        </>
      ) : (
        <>
          <KeyboardAvoidingView
            style={{ flex: 1, width: '100%' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            enabled
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingVertical: 30 }}
            >
              <Container>
                {/* View necessária para manter animação do texto ao abrir teclado no ios */}

                <Form ref={formRef} onSubmit={handleSubmit}>
                  {tipoPagamento == "Boleto" && (
                    <Input
                      name="codigoDoBoleto"
                      placeholder="Código do boleto"
                      onBlur={handleCodigoBoletoBlur}
                    />
                  )}

                  {tipoPagamento == "Imposto" && (
                    <Input
                      name="tipoDeImposto"
                      placeholder="Tipo de imposto"
                    />
                  )}

                  {tipoPagamento == "Recarga de celular" && (
                    <>
                      <Input
                        name="telefone"
                        placeholder="Número de telefone"
                      />

                      <Input
                        name="valorDeRecarga"
                        placeholder="Valor de recarga"
                        keyboardType="decimal-pad"
                      />
                    </>
                  )}

                  {infoPagamento.beneficiario && <Text style={{color:'white', paddingVertical: 15}}>Nome do beneficiário: {infoPagamento.beneficiario}</Text>}
                  {infoPagamento.valor && <Text style={{color:'white', paddingVertical: 15}}>Valor do pagamento: R$ {infoPagamento.valor.toFixed(2)}</Text>}
                  {infoPagamento.vencimento && <Text style={{color:'white', paddingVertical: 15}}>Data de vencimento: {new Date(infoPagamento.vencimento).getDate()}/{new Date(infoPagamento.vencimento).getMonth()+1}/{new Date(infoPagamento.vencimento).getFullYear()}</Text>}

                  {infoPagamento.valor && (
                    <>
                      <Input
                        name="password"
                        placeholder="Senha do cartão"
                        textContentType="newPassword"
                        secureTextEntry
                        returnKeyType="send"
                        onSubmitEditing={() => {
                          formRef.current?.submitForm();
                        }}
                      />

                      <View>
                        <Button
                          onPress={() => {
                            formRef.current?.submitForm();
                          }}
                        >
                          Enviar
                        </Button>
                      </View>
                    </>
                  )}
                </Form>
              </Container>
            </ScrollView>
          </KeyboardAvoidingView>
        </>
      )}
    </View>
  );
};

export default RealizarPagamento;
