import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { FinanceiroModule, FinanceiroNavigation, createFrontendBaseReferenceAdapter, financePermissions, type FinanceHttpClient } from '../src';
import '../src/styles.css';
import './demo.css';

const page = <T,>(items:T[])=>({items,total:items.length,page:1,page_size:20});
const today = new Date().toISOString().slice(0,10);
const http:FinanceHttpClient={
  async get<T>(url:string){let data:unknown=page([]);if(url.includes('analises/visao-geral'))data={periodo_inicial:today,periodo_final:today,a_pagar_atual:'12450.00',a_receber_atual:'18720.00',pagamentos_no_periodo:'3850.00',recebimentos_no_periodo:'7420.00',contas_pagar_prioritarias:[],contas_receber_prioritarias:[]};else if(url==='/pessoas')data=page([{uuid:'11111111-1111-1111-1111-111111111111',nome:'Fornecedor de homologação',nome_fantasia_apelido:'Referência visual'}]);else if(url==='/referencias/unidades-operacionais')data=page([{uuid:'22222222-2222-2222-2222-222222222222',codigo:'UO-01',nome:'Unidade principal'}]);else if(url.includes('/financeiro/referencias/planos-conta'))data=page([{uuid:'33333333-3333-3333-3333-333333333333',codigo:'3.01',nome:'Despesas operacionais'}]);return {data:data as T}},
  async post<T>(){throw new Error('Gravações desabilitadas na homologação visual.')},async patch<T>(){throw new Error('Gravações desabilitadas na homologação visual.')},
};
const permissions=Object.values(financePermissions).flatMap(value=>typeof value==='string'?[value]:Object.values(value)).flatMap(value=>typeof value==='string'?[value]:Object.values(value));
const references=createFrontendBaseReferenceAdapter(http,{supplierRole:'FORNECEDOR',customerRole:'CLIENTE',sellerRole:'VENDEDOR'});
function Demo(){return <QueryClientProvider client={new QueryClient()}><BrowserRouter><div className="demo-shell"><aside><h2>Velortec</h2><FinanceiroNavigation permissions={permissions}/></aside><main><Routes><Route path="/financeiro/*" element={<FinanceiroModule http={http} permissions={permissions} references={references}/>}/><Route path="*" element={<p>Abra uma rota financeira.</p>}/></Routes></main></div></BrowserRouter></QueryClientProvider>}
createRoot(document.getElementById('root')!).render(<React.StrictMode><Demo/></React.StrictMode>);
