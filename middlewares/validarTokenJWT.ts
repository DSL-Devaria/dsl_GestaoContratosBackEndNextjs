// Header, PlayLoad e signature
// sign: 
// validate

import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import type { RespostaPadraoMsg } from '../types/respostaPadraoMsg'
import jwt, { JwtPayload } from "jsonwebtoken";

export const validarTokenJwt = (handler: NextApiHandler) => (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
  try {
    const { MINHA_CHAVE_JWT } = process.env
    if (!MINHA_CHAVE_JWT) {
      return res.status(500).json({ erro: 'ENV jwt Não informado' })
    }
    if (!req || !req.headers) {
      return res.status(401).json({ erro: 'Não foi possível passar o token de acesso' })
    }
    if (req.method !== 'OPTIONS') {
      const authorization = req.headers['authorization']
      if (!authorization) {
        return res.status(401).json({ erro: 'Não foi possível passar o token de acesso' })
      }
      const token = authorization.substring(7)
      if (!token) {
        return res.status(401).json({ erro: 'Não foi possível passar o token de acesso' })
      }
      const decoded = jwt.verify(token, MINHA_CHAVE_JWT) as JwtPayload
      if (!decoded) {
        return res.status(401).json({ erro: 'Não foi possível passar o token de acesso' })
      }
      if (!req.query) {
        req.query = {}
      }
      req.query.userId = decoded._id // e aqui q sai o id do usario logado ? Sim
    }
  } catch (e) {
    console.log(e)
    return res.status(401).json({ erro: 'Não foi possível passar o token de acesso' })
  }
  return handler(req, res)
}