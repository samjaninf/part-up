Feature: Create a part-up

  As a "default" user
  I want to create a part-up
  So that I can share my project/initiative with other uppers

  Scenario: Create partup
    Given I am loggedin
    Given I navigate to "/start/details"
    When I enter the partup details
    Then I should be on the start activities screen
