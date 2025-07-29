Feature: Order Workflow Management
  As a customer service operator
  I want to manage order workflow status changes
  So that I can track orders from creation to delivery

  Background:
    Given the order management system is available

  Scenario: Create a new order successfully
    Given I have valid order data with customer ID "cliente-123"
    And the order contains 2 items with total value 50.00
    When I create a new order
    Then the order should be created with status "PENDENTE"
    And the order should have 2 items
    And the total price should be 50.00

  Scenario: Complete order workflow from creation to delivery
    Given I have a pending order with ID "pedido-123"
    When I confirm the order
    Then the order status should be "CONFIRMADO"
    When I mark the order as received
    Then the order status should be "RECEBIDO"
    When I start order preparation
    Then the order status should be "PREPARANDO"
    When I mark the order as ready
    Then the order status should be "PRONTO"
    When I mark the order as delivered
    Then the order status should be "ENTREGUE"

  Scenario: Calculate preparation time for active orders
    Given I have an order that was created 30 minutes ago
    And the order status is "PREPARANDO"
    When I check the preparation time
    Then the preparation time should be approximately 30 minutes
    
  Scenario: Preparation time should be zero for completed orders
    Given I have a completed order that was created 60 minutes ago
    And the order status is "ENTREGUE"
    When I check the preparation time
    Then the preparation time should be 0

  Scenario: Add items to order and recalculate total
    Given I have an order with 1 item worth 25.00
    When I add another item worth 30.00
    Then the order should have 2 items
    And the total price should be 55.00

  Scenario: Remove items from order and recalculate total
    Given I have an order with 2 items worth 55.00 total
    When I remove 1 item worth 25.00
    Then the order should have 1 item
    And the total price should be 30.00