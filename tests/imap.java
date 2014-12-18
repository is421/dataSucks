import org.openqa.selenium.*;

import java.util.Scanner;
import javax.swing.*;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.ui.Select;
 
public class imap {
	
    public static void main(String[] args) {

        test login = new test();
        WebDriver driver = login.mainLogin();

        String[] tmp = {"Gmail", "Microsoft Account", "Yahoo"};
        //host dropdown
        String host = (String) JOptionPane.showInputDialog(null, "Choose a Host",
                "IMAP", JOptionPane.QUESTION_MESSAGE, null, 
                tmp, // Array of choices
                tmp[0]); // Initial choice
       //System.out.println(host); the user choice
    	 
    	 
    	 
        Scanner scan = new Scanner(System.in);
        System.out.println("Enter a valid " + host + " email");
        String name = scan.nextLine();
        System.out.println("Enter a valid " + host + " password");
        String pass = scan.nextLine();
       
       //Open firefox on localhost
        String baseUrl="http://localhost:80";
        driver.get(baseUrl + "/dashboard");
        
        Select dropHost = new Select(driver.findElement(By.name("host")));
        dropHost.selectByVisibleText(host);
        
        WebElement username = driver.findElement(By.name("username"));
        WebElement password = driver.findElement(By.name("password"));
        WebElement btn = driver.findElement(By.cssSelector("input[value=\"Link\"]"));
        
        username.sendKeys(name);
        password.sendKeys(pass);
        btn.submit();
        
//        driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);     
        if(driver.findElements(By.cssSelector(".alert.alert-danger")).size() != 0){
            System.out.println(driver.findElement(By.cssSelector(".alert.alert-danger")).getText());
        } else {
             System.out.println(driver.findElement(By.cssSelector(".alert.alert-success")).getText());
        }
    }
}
