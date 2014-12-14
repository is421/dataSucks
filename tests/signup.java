import org.openqa.selenium.*;

import java.util.Scanner;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

public class signup {
	
	public static void main(String[] args){
	     
	        //User inputs Account info
	        Scanner scan = new Scanner(System.in);
	        System.out.println("Enter a valid email to register for the site");
	        String name = scan.nextLine();
	        System.out.println("Enter a password");
	        String pass = scan.nextLine();

	        WebDriver driver = new FirefoxDriver();
	        String baseUrl="http://localhost/";
	        driver.get(baseUrl + "signup");
	        
	        WebElement username = driver.findElement(By.name("username"));
	        WebElement password = driver.findElement(By.name("password"));
	        WebElement confirmPassword = driver.findElement(By.name("password2"));
	        WebElement btn = driver.findElement(By.cssSelector("input[value=\"Signup\"]"));
	        
	        username.sendKeys(name);
	        password.sendKeys(pass);
	        confirmPassword.sendKeys(pass);
	        btn.submit();

	        if(driver.getCurrentUrl().equals(baseUrl)){
	        	System.out.println("Success");
	        } else System.out.println("Fail");

	}

}
