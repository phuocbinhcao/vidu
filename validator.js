//Function validator
function Validator(options) {
  //kiểm tra parentElement của input
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var selectorRules = {};

  //hàm thực hiện validate
  function validate(inputElement, rule) {
    var errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSelector);
    var errorMessage;

    //Lấy ra các rule của selector
    var rules = selectorRules[rule.selector];
    //lặp qua từng rules và kiểm tra
    for (let i = 0; i < rules.length; i++) {
      errorMessage = rules[i](inputElement.value);
      if (errorMessage) break; //có lỗi thì dừng kiểm tra
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add(
        "invalid"
      );
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelector).classList.remove(
        "invalid"
      );
    }
    return !errorMessage;
  }
  //Lấy element của form cần validate
  var formElement = document.querySelector(options.form);
  if (formElement) {
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = true;

      //Lặp qua từng rules và validate
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        //submit vơi js
        if (typeof options.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll("[name]");
          var formValues = Array.from(enableInputs).reduce(function (
            values,
            input
          ) {
            values[input.name] = input.value;
            return values;
          },
          {});
          options.onSubmit(formValues);
        }
        //submit vơi hành vi mặc định form
        else {
          formElement.submit();
        }
      }
    };

    //lặp qua các rule và xử lý các sự kiện...
    options.rules.forEach(function (rule) {
      //lưu lại các rule cho mỗi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElement = formElement.querySelector(rule.selector);

      if (inputElement) {
        //blur ra ngoài input
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };
        //khi user nhập input
        inputElement.oninput = function () {
          var errorElement = getParent(
            inputElement,
            options.formGroupSelector
          ).querySelector(options.errorSelector);
          errorElement.innerText = "";
        };
      }
    });
  }
}
//Define rules
// Kiểm tra input rỗng
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim() ? undefined : message || "Vui lòng nhập trường này.";
    },
  };
};
// kiểm tra định dạng email
Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regexEmail.test(value)
        ? undefined
        : message || "Trường này phải là email.";
    },
  };
};
// kiểm tra độ dài chuỗi
Validator.isLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : message || `Phải lớn hơn ${min} ký tự.`;
    },
  };
};
//Kiểm tra định dạng password
Validator.isCheckPass = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regexPass =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
      // Input Password and Submit [8 to 15 characters which contain
      // at least one lowercase letter, one uppercase letter, one numeric digit,
      // and one special character]
      return regexPass.test(value)
        ? undefined
        : message || "Trường này phải là password.";
    },
  };
};
//Kiểm tra sự khác nhau của 2 input
Validator.isConfirmPass = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || "Giá trị nhập không chính xác.";
    },
  };
};
