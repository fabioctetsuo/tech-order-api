export const RABBITMQ_CONSTANTS = {
  QUEUES: {
    PEDIDO_CONFIRMADO: 'pedido.confirmado',
    PEDIDO_RECEBIDO: 'pedido.recebido',
    PEDIDO_PREPARACAO: 'pedido.preparacao',
    PEDIDO_PRONTO: 'pedido.pronto',
    PEDIDO_ENTREGUE: 'pedido.entregue',
  },
  EXCHANGES: {
    PEDIDO: 'pedido.exchange',
  },
  ROUTING_KEYS: {
    PEDIDO_CONFIRMADO: 'pedido.status.confirmado',
    PEDIDO_RECEBIDO: 'pedido.status.recebido',
    PEDIDO_PREPARACAO: 'pedido.status.preparacao',
    PEDIDO_PRONTO: 'pedido.status.pronto',
    PEDIDO_ENTREGUE: 'pedido.status.entregue',
  },
  DLQ_ROUTING_KEYS: {
    PEDIDO_CONFIRMADO: 'pedido.status.confirmado.dlq',
  },
  RETRY: {
    MAX_RETRIES: 3,
    INITIAL_RETRY_DELAY: 1000, // 1 segundo
    MAX_RETRY_DELAY: 60000, // 1 minuto
  },
  TIMEOUT: 30000, // 30 segundos
};
