import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, KeyboardAvoidingView, TextInput, Platform, Alert } from 'react-native';

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
  cpfCnpj: string;
  valor: number;
  banco: string;
  agencia: string;
  conta: string;
  tipo: string;
  password: string;
}

const TransferirValores: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigation = useNavigation();
  const [ existeCadastro, setExisteCadastro ] = useState(null);

  const formRef = useRef<FormHandles>(null);

  const handleCodigoBoletoBlur = async function(e) {
    const res = await api.post('/transferencia/check/cpf_cnpj', {
      cpfCnpj: e.nativeEvent.text,
    }, {
      headers: {
        correntista_id: user.contaCorrente.__correntista__.id
      }
    });

    setExisteCadastro(res.data);
  };

  const handleSubmit = useCallback(
    async (data: FormData) => {
      try {
        formRef.current?.setErrors({});

        if (existeCadastro === false) {
          return Alert.alert(
            'Por enquanto só transferência local.',
          );
        }

        const schema = Yup.object().shape({
          cpfCnpj: Yup.string().required('CPF ou CNPJ é obrigatório.'),
          password: Yup.string().required('Campo obrigatório.'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        await api.post('/transferencia/local', {
          cpfCnpj: data.cpfCnpj,
          valor: data.valor,
        }, {
          headers: {
            correntista_id: user.contaCorrente.__correntista__.id
          }
        });

        updateUser();

        Alert.alert("Transferência realizada com sucesso!");

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        Alert.alert("Saldo insuficiente!");
      }
    },
    [navigation, existeCadastro],
  );

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
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
              <Input
                name="cpfCnpj"
                placeholder="CPF ou CNPJ de destino da transferência"
                onBlur={handleCodigoBoletoBlur}
              />

              {existeCadastro !== null && (
                <>
                  <Input
                    name="valor"
                    placeholder="Valor a ser transferido"
                    keyboardType="decimal-pad"
                  />

                  {existeCadastro === false && (
                    <>
                      <Input
                        name="banco"
                        placeholder="Banco"
                      />

                      <Input
                        name="agencia"
                        placeholder="Agência"
                      />

                      <Input
                        name="conta"
                        placeholder="Conta com dígito"
                      />

                      <Input
                        name="tipo"
                        placeholder="Tipo de transferência"
                      />
                    </>
                  )}

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
    </View>
  );
};

export default TransferirValores;
