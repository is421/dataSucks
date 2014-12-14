import org.openqa.selenium.*;

import java.util.Scanner;
import javax.swing.*;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

 
public class twit {
	
    public static void main(String[] args) {
    	
        test login = new test();
        WebDriver driver = login.mainLogin();

        Scanner scan = new Scanner(System.in);
        System.out.println("Enter a valid twitter username/email");
        String name = scan.nextLine();
        System.out.println("Enter a valid twitter password");
        String pass = scan.nextLine();
       
       //Open firefox on localhost
        String baseUrl="http://localhost:80";
        driver.get(baseUrl + "/dashboard");

        WebElement twitBtn = driver.findElement(By.cssSelector("a[href=\"/auth/twitter\"]"));
        
        twitBtn.click();
        
        
        
        WebElement username = driver.findElement(By.cssSelector("input[class=\"text\"]"));
        WebElement password = driver.findElement(By.cssSelector("input[class=\"password text\"]"));
        WebElement signin  = driver.findElement(By.cssSelector("input[class=\"submit button selected\"]"));
        username.sendKeys(name);
        password.sendKeys(pass);
        signin.submit();
        
        if(driver.findElements(By.cssSelector("span[class=\"message-text\"]")).size() != 0){
        	System.out.println(driver.findElement(By.cssSelector("span[class=\"message-text\"]")).getText());
        } else {
        	WebElement authorize = driver.findElement(By.cssSelector("input[value=\"Authorize app\"]"));
        	authorize.click();
        	System.out.println("Success!");
        }
//        String text = driver.findElement(By.cssSelector("span[class=\"message-text\"]")).getText();
//        System.out.println(text);
        
        driver.close();
    }
}
