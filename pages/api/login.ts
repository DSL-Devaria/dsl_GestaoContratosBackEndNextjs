import type { NextApiRequest, NextApiResponse } from "next";
import { conectarBancoDB } from "@/middlewares/conectaBancoDB";
import type {RespostaPadraoMsg} from '../../types/respostaPadraoMsg'
import type { LoginResposta } from "@/types/LoginResposta";
import { UsuarioModel } from "@/models/usuarioModel";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { politicaCORS } from "@/middlewares/politicaCORS";

const endpointLogin = async (
    req: NextApiRequest,
    res: NextApiResponse<RespostaPadraoMsg | LoginResposta>
  ) => {
    const { MINHA_CHAVE_JWT } = process.env;
    console.log(MINHA_CHAVE_JWT)
    if (!MINHA_CHAVE_JWT) {
      res.status(500).json({ erro: 'ENV jwt Não informado' })
    }
    if (req.method === 'POST') {
      const { login, senha } = req.body;
      try {
        const UsuarioEncontrado = await UsuarioModel.findOne({ email: login });
        if (UsuarioEncontrado) {
          const senhaCorreta = await bcrypt.compare(senha, UsuarioEncontrado.senha);
          if (senhaCorreta) {
            const Usuario = UsuarioEncontrado; // Não é necessário o [0] se você já encontrou um usuário
            const token = jwt.sign({ _id: Usuario._id }, MINHA_CHAVE_JWT!)

            // return res.status(200).json({ msg: `Usuário ${Usuario} encontrado com sucesso` });
            return res.status(200).json({
              nome: Usuario.nome,
              email: Usuario.email,
              token
            })
          }
          return res.status(400).json({ erro: 'O e-mail ou a senha digitados são inválidos' });
        } else {
          return res.status(400).json({ erro: 'Usuário não encontrado' });
        }
      } catch (error) {
        console.log('Erro ao encontrar usuário:', error);
        return res.status(500).json({ erro: 'Erro interno do servidor' });
      }
    }
    return res.status(405).json({ erro: 'Método informado não é válido' });
  }
  
  export default politicaCORS(conectarBancoDB(endpointLogin));