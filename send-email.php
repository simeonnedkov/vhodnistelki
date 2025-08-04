<?php
// Проверка дали заявката е POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  // Получаване на данните от формата
  $name = strip_tags(trim($_POST["name"]));
  $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
  $phone = strip_tags(trim($_POST["phone"]));
  $company = strip_tags(trim($_POST["company"]));
  $service = strip_tags(trim($_POST["service"]));
  $message = strip_tags(trim($_POST["message"]));
  
  // Валидация
  if (empty($name) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
      http_response_code(400);
      echo json_encode(array("success" => false, "message" => "Моля попълнете всички задължителни полета с валидни данни."));
      exit;
  }
  
  // Валидация на телефонен номер, ако е въведен
  if (!empty($phone)) {
    $digitsOnly = preg_replace('/\D/', '', $phone);
    
    // Проверка дали има между 7 и 15 цифри
    if (strlen($digitsOnly) < 7 || strlen($digitsOnly) > 15) {
        http_response_code(400);
        echo json_encode(array("success" => false, "message" => "Моля въведете валиден телефонен номер (7-15 цифри)."));
        exit;
    }
  }
  
  // Настройки за имейла
  $recipient = "simeonnedkov505@gmail.com";
  $subject = "Ново съобщение от сайта - Входни Стелки";
  
  // Съдържание на имейла
  $email_content = "Име: $name\n";
  $email_content .= "Email: $email\n";
  
  if (!empty($phone)) {
      $email_content .= "Телефон: $phone\n";
  }
  
  if (!empty($company)) {
      $email_content .= "Компания: $company\n";
  }
  
  if (!empty($service)) {
      $service_names = array(
          "residential-premium" => "Пакет ЖИЛИЩЕН ВХОД Премиум",
          "residential-standard" => "Пакет ЖИЛИЩЕН ВХОД Стандарт",
          "home-premium" => "Пакет ДОМ Премиум",
          "home-standard" => "Пакет ДОМ Стандарт",
          "small-office-premium" => "Пакет МАЛЪК ОФИС Премиум",
          "small-office-standard" => "Пакет МАЛЪК ОФИС Стандарт",
          "commercial-premium" => "Пакет ТЪРГОВСКИ ОБЕКТ Премиум",
          "commercial-standard" => "Пакет ТЪРГОВСКИ ОБЕКТ Стандарт",
          "consultation" => "Консултация"
      );
      $service_name = isset($service_names[$service]) ? $service_names[$service] : $service;
      $email_content .= "Интересува се от: $service_name\n";
  }
  
  $email_content .= "\nСъобщение:\n$message\n";
  
  // Headers за имейла
  $email_headers = "From: $name <$email>\r\n";
  $email_headers .= "Reply-To: $email\r\n";
  $email_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
  
  // Изпращане на имейла
  if (mail($recipient, $subject, $email_content, $email_headers)) {
      http_response_code(200);
      echo json_encode(array("success" => true, "message" => "Съобщението е изпратено успешно! Ще се свържем с вас скоро."));
  } else {
      http_response_code(500);
      echo json_encode(array("success" => false, "message" => "Възникна грешка при изпращането. Моля опитайте отново."));
  }
} else {
  http_response_code(403);
  echo json_encode(array("success" => false, "message" => "Неразрешен достъп."));
}
?>
